import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Settings,
  Lock,
  User,
  ShieldCheck,
  Key,
  Server,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Camera,
  CheckCircle2,
  Mail,
  Building2,
  FileCheck,
  HelpCircle,
  Award,
  MessageSquare
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
];

export const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [customId, setCustomId] = useState(user?.customId || 'Pankaj1478');
  const [email, setEmail] = useState(user?.email || '');
  const [department, setDepartment] = useState(user?.department || 'Department of Computer Science');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Purge / Reset Dialog States
  const [purgeAction, setPurgeAction] = useState(null); // 'submissions' | 'queries' | 'marks' | 'chat' | 'all'
  const [purgeLoading, setPurgeLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCustomId(user.customId || 'Pankaj1478');
      setEmail(user.email || '');
      setDepartment(user.department || 'Department of Computer Science');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !customId.trim() || !email.trim()) {
      error('Name, Admin ID, and Email are required.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        customId: customId.trim(),
        email: email.trim(),
        department: department.trim(),
        profilePicture: profilePicture.trim()
      });

      if (res.data.success) {
        success('Admin profile updated successfully!');
        updateUser(res.data.user);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

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

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.data.success) {
        success('Admin password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConfirmPurge = async () => {
    if (!purgeAction) return;
    setPurgeLoading(true);
    try {
      if (purgeAction === 'submissions') {
        const res = await api.delete('/submissions/clear/all');
        success(res.data.message || 'All submissions cleared.');
      } else if (purgeAction === 'queries') {
        const res = await api.delete('/queries/clear/all');
        success(res.data.message || 'All queries cleared.');
      } else if (purgeAction === 'marks') {
        const res = await api.delete('/marks/clear/all');
        success(res.data.message || 'All marks cleared.');
      } else if (purgeAction === 'chat') {
        const res = await api.delete('/chat/clear/all');
        success(res.data.message || 'All chat messages cleared.');
      } else if (purgeAction === 'all') {
        const res = await api.post('/stats/admin/reset-data');
        success(res.data.message || 'All portal data reset to clean state.');
      }
      setPurgeAction(null);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to perform cleanup action');
    } finally {
      setPurgeLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
            <Settings className="w-6 h-6" />
          </div>
          Admin Profile & System Authority
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your instructor identity, profile picture, security credentials, and exercise full administrative control over all portal data.
        </p>
      </div>

      {/* 1. ADMIN PROFILE & AVATAR EDITOR */}
      <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-dark-700/80 shadow-dark-glass">
        <h2 className="text-base font-black text-white mb-6 flex items-center gap-2.5">
          <User className="w-5 h-5 text-red-500" />
          Admin Profile & Picture
        </h2>

        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Avatar Preview & Custom URL */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-dark-800/80 border border-dark-700">
            <div className="relative shrink-0">
              <img
                src={
                  profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Admin')}&background=dc2626&color=fff`
                }
                alt={name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-red-500/40 shadow-red-glow-sm"
              />
              <span className="absolute bottom-0 right-0 p-1.5 bg-red-600 rounded-full text-white shadow-sm">
                <Camera className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-2 flex-1 w-full">
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                Profile Picture URL or Choose Avatar
              </label>
              <input
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/my-photo.jpg"
                className="w-full px-4 py-2 bg-dark-900 border border-dark-700 rounded-xl text-xs text-white focus:border-red-500 focus:outline-none placeholder:text-slate-600 font-mono"
              />

              {/* Avatar Preset Badges */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Presets:</span>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setProfilePicture(preset)}
                    className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                      profilePicture === preset ? 'border-red-500 ring-2 ring-red-500/50 scale-110' : 'border-dark-600 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Instructor Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username / Custom ID *
              </label>
              <input
                type="text"
                required
                value={customId}
                onChange={(e) => setCustomId(e.target.value)}
                placeholder="Pankaj1478"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Academic Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
            >
              {profileLoading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. ADMIN PASSWORD & SECURITY */}
      <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-dark-700/80 shadow-dark-glass">
        <h2 className="text-base font-black text-white mb-6 flex items-center gap-2.5">
          <Key className="w-5 h-5 text-red-500" />
          Update Admin Password
        </h2>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 chars"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2.5 bg-dark-800 hover:bg-dark-750 text-white font-bold rounded-xl text-xs sm:text-sm border border-dark-700 hover:border-red-500/40 transition-all disabled:opacity-50 active:scale-95"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* 3. FULL ADMIN DATA REMOVAL & CLEANUP CONTROLS */}
      <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-red-900/50 shadow-dark-glass space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Administrative Data Management & Purge Tools
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Full access controls to wipe submissions, student queries, marks records, or chats whenever you wish to clear test data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Purge Submissions */}
          <div className="p-4 rounded-2xl bg-dark-800/80 border border-dark-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                <FileCheck className="w-4 h-4" />
                <span>Submissions</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Delete all student submitted files and links.
              </p>
            </div>
            <button
              onClick={() => setPurgeAction('submissions')}
              className="w-full py-2 px-3 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Submissions
            </button>
          </div>

          {/* Purge Queries */}
          <div className="p-4 rounded-2xl bg-dark-800/80 border border-dark-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Student Queries</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Delete all student query tickets and replies.
              </p>
            </div>
            <button
              onClick={() => setPurgeAction('queries')}
              className="w-full py-2 px-3 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 font-bold text-xs rounded-xl border border-amber-800/60 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Queries
            </button>
          </div>

          {/* Purge Marks */}
          <div className="p-4 rounded-2xl bg-dark-800/80 border border-dark-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Award className="w-4 h-4" />
                <span>Marks Records</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Delete all recorded marks and evaluations.
              </p>
            </div>
            <button
              onClick={() => setPurgeAction('marks')}
              className="w-full py-2 px-3 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 font-bold text-xs rounded-xl border border-purple-800/60 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Marks
            </button>
          </div>

          {/* Purge Chats */}
          <div className="p-4 rounded-2xl bg-dark-800/80 border border-dark-700 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
                <span>Chat History</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Wipe all 1-on-1 and cohort group messages.
              </p>
            </div>
            <button
              onClick={() => setPurgeAction('chat')}
              className="w-full py-2 px-3 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded-xl border border-rose-800/60 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Chats
            </button>
          </div>
        </div>

        {/* Master Clean Reset */}
        <div className="p-5 rounded-2xl bg-red-950/30 border border-red-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-red-500" />
              Complete Portal Data Reset
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Wipe all temporary submissions, queries, marks, and chat history simultaneously to start fresh.
            </p>
          </div>
          <button
            onClick={() => setPurgeAction('all')}
            className="px-5 py-2.5 bg-gradient-to-r from-red-700 to-rose-700 hover:from-red-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-red-glow transition-all shrink-0 active:scale-95"
          >
            Reset All Portal Data
          </button>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmDialog
        isOpen={!!purgeAction}
        onClose={() => setPurgeAction(null)}
        onConfirm={handleConfirmPurge}
        title={
          purgeAction === 'submissions'
            ? 'Clear All Submissions?'
            : purgeAction === 'queries'
            ? 'Clear All Student Queries?'
            : purgeAction === 'marks'
            ? 'Clear All Marks Records?'
            : purgeAction === 'chat'
            ? 'Clear All Chat Messages?'
            : 'Reset Entire Portal Data?'
        }
        message={
          purgeAction === 'all'
            ? 'This action will permanently delete all student submissions, queries, marks, and messages across all cohorts. This cannot be undone.'
            : `Are you sure you want to permanently delete all ${purgeAction}? This action cannot be reversed.`
        }
        confirmText="Confirm Permanent Delete"
        loading={purgeLoading}
      />
    </div>
  );
};

export default AdminSettings;
