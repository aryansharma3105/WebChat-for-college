import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  Award,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

export const MyMarks = () => {
  const { error } = useToast();

  const [marks, setMarks] = useState([]);
  const [stats, setStats] = useState({
    totalAssessments: 0,
    averagePercentage: 0,
    totalMarksObtained: 0,
    totalMaxMarks: 0,
    subjectBreakdown: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchMyMarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marks/my');
      if (res.data.success) {
        setMarks(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching marks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMarks();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
            <Award className="w-6 h-6" />
          </div>
          Academic Marks & Performance
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Personalized grade report across assignments, quizzes, and midterm evaluations.
        </p>
      </div>

      {/* Privacy notice */}
      <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-emerald-300">Privacy & Confidentiality: </span>
          Your marks and assessment evaluations are strictly private and visible only to you and your instructor.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Overall Average"
          value={`${stats.averagePercentage || 0}%`}
          subtitle="Cumulative GPA performance"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Score"
          value={`${stats.totalMarksObtained || 0}/${stats.totalMaxMarks || 0}`}
          subtitle="Total marks earned"
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Evaluated Tasks"
          value={stats.totalAssessments || 0}
          subtitle="Graded assignments & tests"
          icon={BookOpen}
          color="brand"
        />
      </div>

      {/* Marks Table */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : marks.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No marks recorded yet"
          description="Your evaluations will appear here as your instructor grades your submissions."
        />
      ) : (
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700/80 bg-dark-800/70 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Assessment</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Grade %</th>
                  <th className="px-6 py-4">Teacher Feedback</th>
                  <th className="px-6 py-4">Graded Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-750/60 text-xs">
                {marks.map((m) => {
                  const pct = Math.round((m.marksObtained / m.totalMarks) * 100);
                  return (
                    <tr
                      key={m._id}
                      className="hover:bg-dark-800/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-black text-white">
                        {m.subject}
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-300">
                        {m.assessmentName}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-white text-sm">{m.marksObtained}</span>
                        <span className="text-[11px] text-slate-500 font-mono">/{m.totalMarks}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[11px] font-black rounded-full border ${
                            pct >= 85
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : pct >= 65
                              ? 'bg-red-950/60 text-red-400 border-red-800/60 shadow-red-glow-sm'
                              : 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400 max-w-sm">
                        {m.remarks ? (
                          <span className="italic">"{m.remarks}"</span>
                        ) : (
                          <span className="text-slate-600 italic">No specific remarks</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-[11px] text-slate-500">
                        {format(new Date(m.createdAt), 'MMM d, yyyy')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMarks;
