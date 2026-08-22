import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-dark-850/90 border-t border-dark-700/80 sm:px-6 rounded-b-3xl">
      <div className="flex justify-between flex-1 sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl text-slate-300 bg-dark-800 border border-dark-700 hover:border-red-500/40 disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl text-slate-300 bg-dark-800 border border-dark-700 hover:border-red-500/40 disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium">
            Showing Page <span className="font-bold text-white">{currentPage}</span> of{' '}
            <span className="font-bold text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex gap-1.5 p-1 bg-dark-900 rounded-xl border border-dark-750">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-red-glow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-dark-800'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
