import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
        {isDestructive && (
          <div className="p-3 bg-red-950/70 text-red-400 border border-red-800/60 rounded-2xl shrink-0 shadow-red-glow-sm">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}
        <div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2.5 text-xs font-bold text-slate-300 bg-dark-800 hover:bg-dark-750 border border-dark-700 hover:border-dark-600 rounded-xl transition-all disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all duration-200 disabled:opacity-50 ${
            isDestructive
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-glow hover:shadow-red-glow-lg'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-glow'
          }`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
