import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Settings,
  Lock,
  User,
  ShieldCheck,
  Key,
  Server,
  Database,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const AdminSettings = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        success('Admin password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
            <Settings className="w-6 h-6" />
          </div>
          System Settings & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure admin security credentials, view server status, and manage portal preferences.
        </p>
      </div>

      {/* Admin Profile Overview */}
      <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-dark-700/80 shadow-dark-glass">
        <div className="flex items-center gap-5 mb-6">
          <div className="relative shrink-0">
            <img
              src={
                user?.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=dc2626&color=fff`
              }
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-red-500/30 shadow-red-glow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-dark-850 shadow-sm"></span>
          </div>
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2.5 flex-wrap">
              {user?.name}
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm uppercase tracking-wider">
                Super Admin
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Admin ID: <span className="font-bold text-red-400">{user?.customId || 'admin-profpankaj25'}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Full Administrative & Grading Authority
            </p>
          </div>
        </div>

        {/* Security / Password update section */}
        <div className="pt-6 border-t border-dark-750">
          <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-red-500" />
            Update Admin Password
          </h3>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                New Secure Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      </div>

      {/* System Infrastructure Details */}
      <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-dark-700/80 shadow-dark-glass">
        <h3 className="text-sm font-black text-white mb-5 flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          Backend & Real-time Services
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-dark-800/90 border border-emerald-900/50 shadow-[0_0_12px_rgba(16,185,129,0.08)]">
            <p className="font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">Database Engine</p>
            <p className="font-black text-white mt-2 text-sm">MongoDB / Mongoose</p>
            <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Active
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-800/90 border border-red-900/40 shadow-red-glow-sm">
            <p className="font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">Socket Server</p>
            <p className="font-black text-white mt-2 text-sm">Socket.IO WebSockets</p>
            <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active Gateway
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-dark-800/90 border border-amber-900/40 shadow-[0_0_12px_rgba(245,158,11,0.08)]">
            <p className="font-extrabold text-slate-400 uppercase text-[10px] tracking-widest">Student Auth</p>
            <p className="font-black text-white mt-2 text-sm">Google OAuth 2.0</p>
            <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Secured & Enabled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
