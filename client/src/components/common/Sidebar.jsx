import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  LayoutDashboard,
  Users,
  Layers,
  FileText,
  CheckCircle,
  Award,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
  User,
  X,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { unreadChatCount } = useSocket();
  const [collapsed, setCollapsed] = useState(false);

  const adminNav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/groups', label: 'Groups', icon: Layers },
    { to: '/admin/assignments', label: 'Assignments', icon: FileText },
    { to: '/admin/submissions', label: 'Submissions', icon: CheckCircle },
    { to: '/admin/marks', label: 'Marks', icon: Award },
    { to: '/admin/notes', label: 'Notes & Material', icon: BookOpen },
    { to: '/admin/queries', label: 'Queries & Help', icon: HelpCircle },
    { to: '/admin/chat', label: 'Chat Hub', icon: MessageSquare, badge: unreadChatCount },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const studentNav = [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/groups', label: 'My Groups', icon: Layers },
    { to: '/student/assignments', label: 'Assignments', icon: FileText },
    { to: '/student/submissions', label: 'Submissions', icon: CheckCircle },
    { to: '/student/marks', label: 'My Marks', icon: Award },
    { to: '/student/notes', label: 'Notes & Material', icon: BookOpen },
    { to: '/student/queries', label: 'Support Desk', icon: HelpCircle },
    { to: '/student/chat', label: 'Academic Chat', icon: MessageSquare, badge: unreadChatCount },
    { to: '/student/profile', label: 'Profile', icon: User },
  ];

  const navItems = isAdmin ? adminNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 flex flex-col justify-between h-screen bg-dark-900/95 backdrop-blur-2xl border-r border-dark-700/80 transition-all duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Top Brand Header */}
        <div className="flex flex-col">
          <div className={`flex items-center justify-between h-18 px-5 border-b border-dark-750/70 ${collapsed ? 'justify-center px-2' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="relative group p-2.5 bg-gradient-to-br from-red-600 to-red-800 rounded-xl text-white shadow-red-glow transition-transform group-hover:scale-105">
                <GraduationCap className="w-5 h-5" />
                <div className="absolute inset-0 bg-red-500 rounded-xl blur-sm opacity-40 group-hover:opacity-75 transition-opacity" />
              </div>
              {!collapsed && (
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-white via-slate-100 to-red-400 bg-clip-text text-transparent">
                    Edu<span className="text-red-500">Portal</span>
                  </span>
                  <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">
                    {isAdmin ? 'Admin Console' : 'Student Portal'}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white md:hidden rounded-lg hover:bg-dark-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-11rem)]">
            {!collapsed && (
              <div className="px-3 pt-2 pb-1.5 text-[10px] font-extrabold tracking-widest text-slate-500 uppercase flex items-center justify-between">
                <span>{isAdmin ? 'Management' : 'My Academics'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              </div>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={collapsed ? item.label : undefined}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={({ isActive }) =>
                    `group relative flex items-center ${
                      collapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600/25 via-red-600/10 to-transparent border-l-4 border-red-500 text-white font-bold shadow-[inset_0_1px_0_rgba(239,68,68,0.2)]'
                        : 'text-slate-400 hover:bg-dark-800/80 hover:text-slate-100 hover:border-l-2 hover:border-dark-600'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        {!collapsed && <span>{item.label}</span>}
                      </div>

                      {item.badge > 0 && (
                        <span
                          className={`${
                            collapsed
                              ? 'absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px]'
                              : 'px-2 py-0.5 text-xs'
                          } font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 rounded-full shadow-red-glow`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Area: Collapse toggle & Sign Out */}
        <div className="p-3 border-t border-dark-750/70 space-y-1.5">
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-dark-800 rounded-xl transition-colors gap-2"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Panel</span>
              </>
            )}
          </button>

          <button
            onClick={logout}
            title={collapsed ? 'Sign Out' : undefined}
            className={`flex items-center ${
              collapsed ? 'justify-center' : ''
            } w-full gap-3 px-3.5 py-2.5 text-sm font-semibold text-red-400 hover:text-white hover:bg-red-950/40 hover:border hover:border-red-500/30 rounded-xl transition-all duration-200`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
