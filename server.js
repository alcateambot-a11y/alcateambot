require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const authRoutes = require('./routes/auth');
const botRoutes = require('./routes/bots');
const userRoutes = require('./routes/user');
const deviceRoutes = require('./routes/devices');
const messageRoutes = require('./routes/messages');
const webhookRoutes = require('./routes/webhooks');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const { sequelize } = require('./config/database');
const { Bot } = require('./models');
const { createSession } = require('./services/whatsapp');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: function(origin, callback) {
      // Allow all origins in production for Railway
      callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Middleware
// Add ngrok skip browser warning header
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

app.use(cors({ 
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow all ngrok domains and localhost
    if (origin.includes('ngrok') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now
  },
  credentials: true 
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'wa-gateway-session',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/bots', botRoutes);
app.use('/user', userRoutes);
app.use('/devices', deviceRoutes);
app.use('/messages', messageRoutes);
app.use('/webhooks', webhookRoutes);
app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running', time: new Date().toISOString() });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, 'client/dist')));
app.get('*', (req, res, next) => {
  // Skip API routes (but allow /auth/callback for frontend)
  const isApiRoute = (
    (req.path.startsWith('/auth') && req.path !== '/auth/callback') || 
    req.path.startsWith('/bots') || 
    req.path.startsWith('/user') || 
    req.path.startsWith('/devices') ||
    req.path.startsWith('/messages') || 
    req.path.startsWith('/webhooks') ||
    req.path.startsWith('/api') || 
    req.path.startsWith('/admin') ||
    req.path.startsWith('/socket.io')
  );
  
  if (isApiRoute) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Socket.io for real-time QR & status
global.io = io;
io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);
  
  socket.on('disconnect', (reason) => {
    console.log('Socket client disconnected:', socket.id, 'reason:', reason);
  });
  
  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

console.log('Socket.IO server initialized');

const PORT = process.env.PORT || 3000;
const fs = require('fs');

// Auto-reconnect bots on server startup
async function autoReconnectBots() {
  try {
    console.log('Checking for bots to auto-reconnect...');
    const sessionsDir = path.join(__dirname, 'sessions');
    
    if (!fs.existsSync(sessionsDir)) {
      console.log('No sessions directory found');
      return;
    }
    
    // Get all bot folders in sessions
    const botFolders = fs.readdirSync(sessionsDir).filter(f => {
      const folderPath = path.join(sessionsDir, f);
      return fs.statSync(folderPath).isDirectory();
    });
    
    console.log('Found session folders:', botFolders);
    
    // Import selfbot connection
    const { createSelfbotSession } = require('./services/selfbotConnection');
    
    // Reconnect bots with delay between each to prevent spam
    for (let i = 0; i < botFolders.length; i++) {
      const folderName = botFolders[i];
      const sessionPath = path.join(sessionsDir, folderName);
      const hasSession = fs.readdirSync(sessionPath).length > 0;
      
      if (hasSession) {
        // Check if this is a selfbot session (starts with "selfbot_")
        const isSelfbot = folderName.startsWith('selfbot_');
        const botId = isSelfbot ? parseInt(folderName.replace('selfbot_', '')) : parseInt(folderName);
        
        // Check if bot exists in database
        const bot = await Bot.findByPk(botId);
        if (bot) {
          if (isSelfbot && bot.isSelfbot) {
            console.log('Auto-reconnecting SELFBOT:', botId, 'for user:', bot.userId);
            try {
              await createSelfbotSession(botId, bot.userId, bot.phone);
              // Add 5 second delay between each bot reconnect to prevent spam
              if (i < botFolders.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
            } catch (err) {
              console.error('Failed to auto-reconnect selfbot', botId, ':', err.message);
            }
          } else if (!isSelfbot && !bot.isSelfbot) {
            console.log('Auto-reconnecting bot:', botId, 'for user:', bot.userId);
            try {
              await createSession(botId, bot.userId);
              // Add 5 second delay between each bot reconnect to prevent spam
              if (i < botFolders.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
            } catch (err) {
              console.error('Failed to auto-reconnect bot', botId, ':', err.message);
            }
          }
        } else {
          console.log('Bot', botId, 'not found in database, skipping');
        }
      }
    }
    
    console.log('Auto-reconnect complete');
  } catch (err) {
    console.error('Auto-reconnect error:', err);
  }
}

// Sync database
sequelize.sync().then(async () => {
  server.listen(PORT, async () => {
    console.log('Server running on port ' + PORT);
    
    // Auto-reconnect bots after server starts
    setTimeout(autoReconnectBots, 2000);
    
    // Start premium checker service
    const { startPremiumChecker } = require('./services/premiumChecker');
    startPremiumChecker();
  });
}).catch(err => {
  console.error('Database sync error:', err);
});
