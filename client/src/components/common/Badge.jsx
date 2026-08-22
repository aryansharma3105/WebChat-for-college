import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variants = {
    default: 'bg-dark-800 text-slate-300 border-dark-700',
    primary: 'bg-red-950/60 text-red-400 border-red-800/60 shadow-red-glow-sm',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    danger: 'bg-rose-950/70 text-rose-400 border-rose-800/70 shadow-red-glow-sm',
    info: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
