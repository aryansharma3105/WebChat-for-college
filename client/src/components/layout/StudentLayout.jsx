import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { Phone, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

export const StudentLayout = () => {
  const { user, loading, isStudent, updateUser } = useAuth();
  const { success, error } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Mandatory mobile number prompt state
  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  const handleSaveMandatoryPhone = async (e) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      error('Please enter a valid mobile number.');
      return;
    }

    setSavingPhone(true);
    try {
      const res = await api.put('/auth/profile', {
        phoneNumber: phoneInput.trim()
      });

      if (res.data.success) {
        success('Mobile number registered successfully! Welcome to the portal.');
        updateUser(res.data.user);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to save mobile number');
    } finally {
      setSavingPhone(false);
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

  const isPhoneMissing = !user?.phoneNumber;

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

      {/* MANDATORY MOBILE NUMBER REGISTRATION MODAL */}
      {isPhoneMissing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-dark-900 border border-red-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/50 space-y-6 relative overflow-hidden"
          >
            {/* Ambient Red Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex p-3 bg-red-950/80 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
                <Phone className="w-7 h-7 animate-bounce" />
              </div>
              <h2 className="text-xl font-black text-white">
                Mobile Number Required
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                University portal policy requires all enrolled students to link an active contact mobile number for instructor communication and emergency updates.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-dark-800/90 border border-dark-750 text-xs text-slate-300 space-y-1.5 relative z-10">
              <div className="flex items-center gap-2 text-red-400 font-bold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Anti-Duplication Policy</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Each student must have a unique mobile number. Duplicate numbers across multiple student accounts are strictly prohibited.
              </p>
            </div>

            <form onSubmit={handleSaveMandatoryPhone} className="space-y-4 relative z-10">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                  Enter Your Active Mobile Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="tel"
                    required
                    autoFocus
                    placeholder="e.g. +91 98765 43210"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Format: +[Country Code] [10-Digit Mobile Number]
                </p>
              </div>

              <button
                type="submit"
                disabled={savingPhone || !phoneInput.trim()}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {savingPhone ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Save Mobile Number & Unlock Portal</span>
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
