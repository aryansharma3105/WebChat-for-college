import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Layers
} from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin, loginGoogle, loginDemoStudent } = useAuth();
  const { success, error } = useToast();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'student'
  const [adminId, setAdminId] = useState('admin-profpankaj25');
  const [password, setPassword] = useState('pass1225');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Custom student quick login
  const demoStudents = [
    { id: '', name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', desc: 'DSA & DBMS Batch' },
    { id: '', name: 'Priya Singh', email: 'priya.singh@gmail.com', desc: 'Top Performer' },
    { id: '', name: 'Aman Kumar', email: 'aman.kumar@gmail.com', desc: 'Pending Tasks & Query' },
    { id: '', name: 'Sneha Patel', email: 'sneha.patel@gmail.com', desc: 'Web Tech Cohort' },
  ];

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(adminId, password);
      success('Welcome back, Professor!');
      navigate('/admin');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudentClick = async (email) => {
    setLoading(true);
    try {
      await loginDemoStudent(undefined, email);
      success(`Signed in as demo student: ${email}`);
      navigate('/student');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Student login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomStudentLogin = async (e) => {
    e.preventDefault();
    const studentEmail = e.target.studentEmail.value.trim();
    const studentName = e.target.studentName.value.trim() || 'Student User';

    if (!studentEmail) {
      error('Please enter an email address');
      return;
    }

    setLoading(true);
    try {
      // Simulate Google OAuth payload
      await loginGoogle({
        email: studentEmail,
        name: studentName,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=dc2626&color=fff`,
        sub: `google-${Date.now()}`
      });
      success(`Welcome, ${studentName}!`);
      navigate('/student');
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-dark-950 text-slate-100 overflow-hidden">
      {/* Background Animated Red Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-red-800/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-dark-850/80 backdrop-blur-md border border-dark-700/80 text-slate-300 shadow-dark-glass hover:text-white hover:border-red-500/40 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-red-400" />}
        </button>
      </div>

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4 relative z-10"
      >
        <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl text-white shadow-red-glow mb-4 ring-1 ring-red-500/30">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Edu<span className="text-red-500">Portal</span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-medium text-slate-400 max-w-sm mx-auto">
          Enterprise Academic & Student Group Management System
        </p>
      </motion.div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 relative z-10"
      >
        <div className="bg-dark-900/90 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-dark-700/80 hover:border-red-500/30 transition-all duration-300">
          {/* Tab Selector */}
          <div className="flex p-1.5 mb-7 bg-dark-800/90 rounded-2xl border border-dark-700">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Teacher / Admin Mode
            </button>
            <button
              onClick={() => setActiveTab('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Access
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* ADMIN LOGIN TAB */}
            {activeTab === 'admin' && (
              <motion.div
                key="admin-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Default Credentials Callout */}
                <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-900/50 flex items-start gap-3 shadow-inner-red">
                  <ShieldCheck className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-300">
                    <span className="font-bold text-white">Default Admin Credentials:</span>
                    <div className="mt-1 font-mono text-red-300">
                      ID: <span className="font-bold text-white">admin-profpankaj25</span> | Password: <span className="font-bold text-white">pass1225</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                      Admin ID / Email
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                        placeholder="admin-profpankaj25"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-dark-800/90 border border-dark-700 rounded-xl text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-11 pr-11 py-3 bg-dark-800/90 border border-dark-700 rounded-xl text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm rounded-xl shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In as Admin</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* STUDENT LOGIN TAB */}
            {activeTab === 'student' && (
              <motion.div
                key="student-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <form onSubmit={handleCustomStudentLogin} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      Student Full Name
                    </label>
                    <input
                      name="studentName"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      defaultValue="Rahul Sharma"
                      className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                      Student Gmail Address
                    </label>
                    <input
                      name="studentEmail"
                      type="email"
                      placeholder="e.g. rahul.sharma@gmail.com"
                      defaultValue="rahul.sharma@gmail.com"
                      required
                      className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-dark-700 bg-dark-800 hover:bg-dark-750 hover:border-red-500/40 font-bold text-white text-xs shadow-sm transition-all active:scale-98"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Sign In via Student Google Account</span>
                  </button>
                </form>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-dark-750"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                    Or Instant Demo Sign-In
                  </span>
                  <div className="flex-grow border-t border-dark-750"></div>
                </div>

                {/* Quick demo student switcher */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {demoStudents.map((s) => (
                    <button
                      key={s.email}
                      type="button"
                      onClick={() => handleDemoStudentClick(s.email)}
                      disabled={loading}
                      className="p-3 text-left rounded-xl border border-dark-700/80 bg-dark-800/80 hover:bg-dark-750 hover:border-red-500/40 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white group-hover:text-red-400 transition-colors">
                          {s.name}
                        </p>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                        {s.email}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {s.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
