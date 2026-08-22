import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  actionText,
  onAction
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-dark-850/80 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass my-4"
    >
      <div className="relative p-5 bg-dark-800 rounded-3xl text-red-400 border border-dark-700 mb-4 shadow-red-glow-sm">
        <Icon className="w-9 h-9" />
        <div className="absolute inset-0 bg-red-600/10 rounded-3xl blur-md" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
        {title}
      </h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-red-glow hover:shadow-red-glow-lg transition-all duration-200 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
