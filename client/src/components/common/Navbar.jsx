import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import {
  Sun,
  Moon,
  LogOut,
  Menu,
  Bell,
  ShieldCheck,
  GraduationCap,
  Wifi,
  WifiOff,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { connected, unreadChatCount } = useSocket();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-18 px-4 sm:px-6 bg-dark-900/80 backdrop-blur-xl border-b border-dark-750/80">
      {/* Left section: mobile hamburger & mode badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-1 text-slate-400 hover:text-white hover:bg-dark-800 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          {isAdmin ? (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-red-950/60 text-red-400 rounded-full border border-red-800/60 shadow-red-glow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              Instructor Console
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-red-950/40 text-red-400 rounded-full border border-red-900/40">
              <GraduationCap className="w-3.5 h-3.5 text-red-400" />
              Student Academic Hub
            </span>
          )}
        </div>
      </div>

      {/* Right section: realtime status, theme toggle, user profile pill & logout */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Realtime Live Pulse Indicator */}
        <div
          title={connected ? 'Realtime Socket Connected' : 'Connecting to Realtime...'}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-800 border border-dark-700 text-[11px] font-semibold text-slate-400"
        >
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{connected ? 'Live Sync' : 'Connecting'}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-xl transition-colors border border-transparent hover:border-dark-700"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-red-400" />}
        </button>

        {/* User profile dropdown pill */}
        <div className="flex items-center gap-3 pl-2 sm:pl-3 border-l border-dark-750">
          <div className="relative">
            <img
              src={
                user?.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=dc2626&color=fff`
              }
              alt={user?.name}
              className="w-9 h-9 rounded-full ring-2 ring-red-500/30 object-cover shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-dark-900" />
          </div>

          <div className="hidden md:block text-left">
            <p className="text-sm font-bold text-white leading-tight">
              {user?.name}
            </p>
            <p className="text-[11px] font-medium text-slate-400 capitalize">
              {isAdmin ? 'Chief Instructor' : user?.rollNumber || 'Enrolled Student'}
            </p>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-red-400 hover:text-white hover:bg-red-950/50 hover:border hover:border-red-600/40 rounded-xl transition-all ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
