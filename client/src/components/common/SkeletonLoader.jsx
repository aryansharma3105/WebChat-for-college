import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-dark-850/90 rounded-3xl p-6 border border-dark-700/80 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 bg-dark-700 rounded-md w-1/3"></div>
      <div className="h-8 w-8 bg-dark-700 rounded-xl"></div>
    </div>
    <div className="h-8 bg-dark-700 rounded-md w-1/2 mb-3"></div>
    <div className="h-3 bg-dark-750 rounded-md w-2/3"></div>
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="bg-dark-850/90 rounded-3xl border border-dark-700/80 overflow-hidden animate-pulse">
    <div className="h-12 bg-dark-800 border-b border-dark-700/80"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 border-b border-dark-750/50">
        <div className="flex items-center gap-3 w-1/3">
          <div className="w-10 h-10 bg-dark-700 rounded-full shrink-0"></div>
          <div className="w-full">
            <div className="h-4 bg-dark-700 rounded-md w-3/4 mb-1.5"></div>
            <div className="h-3 bg-dark-750 rounded-md w-1/2"></div>
          </div>
        </div>
        <div className="h-4 bg-dark-750 rounded-md w-1/4"></div>
        <div className="h-6 bg-dark-700 rounded-full w-20"></div>
        <div className="h-8 bg-dark-750 rounded-xl w-24"></div>
      </div>
    ))}
  </div>
);

export default { SkeletonCard, SkeletonTable };
