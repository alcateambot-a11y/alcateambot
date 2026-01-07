import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Dashboard from './pages/Dashboard'
import Config from './pages/Config'
import Mess from './pages/Mess'
import Command from './pages/Command'
import FilterCommand from './pages/FilterCommand'
import Menu from './pages/Menu'
import FAQ from './pages/FAQ'
import Changelog from './pages/Changelog'
import Setting from './pages/Setting'
import Invoice from './pages/Invoice'
import Pricing from './pages/Pricing'
import Subscription from './pages/Subscription'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminBots from './pages/admin/Bots'
import AdminInvoices from './pages/admin/Invoices'
import AdminSettings from './pages/admin/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/pricing" element={<Pricing />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/pricing" element={<Pricing />} />
        <Route path="/dashboard/faq" element={<FAQ />} />
        <Route path="/dashboard/changelog" element={<Changelog />} />
        
        {/* Bot Settings */}
        <Route path="/dashboard/config" element={<Config />} />
        <Route path="/dashboard/mess" element={<Mess />} />
        <Route path="/dashboard/command" element={<Command />} />
        <Route path="/dashboard/filter-command" element={<FilterCommand />} />
        <Route path="/dashboard/menu" element={<Menu />} />
        
        {/* User */}
        <Route path="/dashboard/setting" element={<Setting />} />
        <Route path="/dashboard/invoice" element={<Invoice />} />
        <Route path="/dashboard/subscription" element={<Subscription />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/bots" element={<AdminBots />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </ThemeProvider>
  )
}
