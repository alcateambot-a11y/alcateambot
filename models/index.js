const User = require('./User');
const Bot = require('./Bot');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const Command = require('./Command');
const Filter = require('./Filter');
const Invoice = require('./Invoice');
const PremiumUser = require('./PremiumUser');
const Sewa = require('./Sewa');

// User -> Bot (1:1 now)
User.hasOne(Bot, { foreignKey: 'userId' });
Bot.belongsTo(User, { foreignKey: 'userId' });

// Bot -> Group (1:many)
Bot.hasMany(Group, { foreignKey: 'botId' });
Group.belongsTo(Bot, { foreignKey: 'botId' });

// Group -> GroupMember (1:many)
Group.hasMany(GroupMember, { foreignKey: 'groupId' });
GroupMember.belongsTo(Group, { foreignKey: 'groupId' });

// Bot -> Command (1:many)
Bot.hasMany(Command, { foreignKey: 'botId' });
Command.belongsTo(Bot, { foreignKey: 'botId' });

// Bot -> Filter (1:many)
Bot.hasMany(Filter, { foreignKey: 'botId' });
Filter.belongsTo(Bot, { foreignKey: 'botId' });

// User -> Invoice (1:many)
User.hasMany(Invoice, { foreignKey: 'userId' });
Invoice.belongsTo(User, { foreignKey: 'userId' });

// Bot -> PremiumUser (1:many)
Bot.hasMany(PremiumUser, { foreignKey: 'botId' });
PremiumUser.belongsTo(Bot, { foreignKey: 'botId' });

// Bot -> Sewa (1:many)
Bot.hasMany(Sewa, { foreignKey: 'botId' });
Sewa.belongsTo(Bot, { foreignKey: 'botId' });

module.exports = { User, Bot, Group, GroupMember, Command, Filter, Invoice, PremiumUser, Sewa };
