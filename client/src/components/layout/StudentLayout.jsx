import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import {
  Phone,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  User,
  Hash,
  Building2,
  Camera,
  Sparkles
} from 'lucide-react';

const STUDENT_AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
];

export const StudentLayout = () => {
  const { user, loading, isStudent, updateUser } = useAuth();
  const { success, error } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Mandatory Profile Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phoneNumber || '');
      setRollNumber(user.rollNumber && !user.rollNumber.startsWith('STU-') ? user.rollNumber : '');
      setDepartment(user.department || 'Computer Science & Engineering');
      setProfilePicture(user.profilePicture || STUDENT_AVATAR_PRESETS[0]);
    }
  }, [user]);

  const handleSaveMandatoryProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !rollNumber.trim()) {
      error('Full Name, Mobile Number, and Roll Number are required.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', {
        name: name.trim(),
        phoneNumber: phone.trim(),
        rollNumber: rollNumber.trim(),
        department: department.trim(),
        profilePicture: profilePicture.trim()
      });

      if (res.data.success) {
        success('Student profile verified and saved successfully!');
        updateUser(res.data.user);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save student profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-950">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute w-6 h-6 rounded-full bg-red-600/30 blur-md animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isStudent) {
    return <Navigate to="/admin" replace />;
  }

  // Check if student profile is incomplete
  const isProfileIncomplete =
    !user?.phoneNumber ||
    !user?.rollNumber ||
    user?.rollNumber.startsWith('STU-');

  return (
    <div className="flex min-h-screen bg-dark-950 text-slate-100 selection:bg-red-600 selection:text-white">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MANDATORY STUDENT PROFILE COMPLETION MODAL */}
      {isProfileIncomplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-dark-900 border border-red-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 space-y-6 relative overflow-hidden my-8"
          >
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex p-3 bg-red-950/80 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
                <Sparkles className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-white">
                Complete Your Student Profile
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Please verify your details and register your official contact mobile number. Your instructor uses this for academic contact and assignments.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-dark-800/90 border border-dark-750 text-xs text-slate-300 space-y-1 relative z-10">
              <div className="flex items-center gap-2 text-red-400 font-bold text-[11px]">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Anti-Duplication Contact Policy</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Each mobile number must be unique to one student account. Duplicate numbers will be rejected.
              </p>
            </div>

            <form onSubmit={handleSaveMandatoryProfile} className="space-y-4 relative z-10">
              {/* Avatar Chooser */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Choose Profile Avatar
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Student')}&background=dc2626&color=fff`
                    }
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-red-500/40 shrink-0"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    {STUDENT_AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfilePicture(preset)}
                        className={`w-8 h-8 rounded-full overflow-hidden border transition-all ${
                          profilePicture === preset
                            ? 'border-red-500 ring-2 ring-red-500/60 scale-110'
                            : 'border-dark-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                  Contact Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Roll Number & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Roll Number / Student ID *
                  </label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS2026-001"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Computer Science"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile || !name.trim() || !phone.trim() || !rollNumber.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 mt-2"
              >
                {savingProfile ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save Profile & Enter Academic Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;
