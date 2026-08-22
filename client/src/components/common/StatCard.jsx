import React from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'brand', trend }) => {
  const colorMap = {
    brand: 'bg-red-950/70 text-red-400 border-red-800/60 shadow-red-glow-sm',
    emerald: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-800/60 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    rose: 'bg-rose-950/70 text-rose-400 border-rose-800/60 shadow-red-glow-sm',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
    blue: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-dark-850/90 backdrop-blur-xl rounded-2xl p-6 border border-dark-700/80 hover:border-red-500/40 shadow-dark-glass hover:shadow-red-glow transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      {/* Top subtle red ambient light on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/0 to-transparent group-hover:via-red-500 transition-all duration-500" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase">
            {title}
          </span>
          {Icon && (
            <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.brand} transition-transform group-hover:scale-110 duration-200`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight group-hover:text-red-50 transition-colors">
            {value}
          </span>
          {trend && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-900/50">
              {trend}
            </span>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="mt-3 text-xs text-slate-400 font-medium">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;
