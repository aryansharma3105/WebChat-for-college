import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  Users,
  Layers,
  FileText,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats/admin');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonTable rows={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-dark-900 via-dark-850 to-red-950/40 border border-dark-700/80 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        {/* Subtle red ambient glow inside banner */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-extrabold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 text-red-500" />
            Instructor Central Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Academic Management Console
          </h1>
          <p className="mt-1.5 text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
            Live overview of student cohorts, assignment evaluations, grading compliance, and real-time support inquiries.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            to="/admin/assignments"
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <FileText className="w-4 h-4" />
            + New Assignment
          </Link>
          <Link
            to="/admin/groups"
            className="px-4 py-2.5 bg-dark-800 hover:bg-dark-750 text-white font-bold rounded-xl text-xs sm:text-sm border border-dark-700 hover:border-red-500/40 transition-all flex items-center gap-2 active:scale-95"
          >
            <Layers className="w-4 h-4" />
            + Create Cohort
          </Link>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Registered active students"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Active Cohorts"
          value={stats?.totalGroups || 0}
          subtitle="Organized student groups"
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Submissions Received"
          value={stats?.totalSubmittedAll || 0}
          subtitle={`${stats?.totalLateSubmissions || 0} late submissions`}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title="Open Queries"
          value={stats?.openQueries || 0}
          subtitle={`${stats?.inProgressQueries || 0} in progress tickets`}
          icon={HelpCircle}
          color="amber"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-dark-850/90 backdrop-blur-xl p-5 rounded-2xl border border-dark-700/80 hover:border-red-500/30 transition-all flex items-center justify-between shadow-dark-glass">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Class Average Score</p>
            <p className="text-2xl font-black text-white mt-1">
              {stats?.averageClassPercentage || 0}%
            </p>
          </div>
          <div className="p-3 bg-red-950/60 text-red-400 border border-red-900/50 rounded-xl shadow-red-glow-sm">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-dark-850/90 backdrop-blur-xl p-5 rounded-2xl border border-dark-700/80 hover:border-red-500/30 transition-all flex items-center justify-between shadow-dark-glass">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Shared Study Notes</p>
            <p className="text-2xl font-black text-white mt-1">
              {stats?.totalNotes || 0}
            </p>
          </div>
          <div className="p-3 bg-dark-800 text-red-400 border border-dark-700 rounded-xl">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-dark-850/90 backdrop-blur-xl p-5 rounded-2xl border border-dark-700/80 hover:border-red-500/30 transition-all flex items-center justify-between shadow-dark-glass">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Unread Messages</p>
            <p className="text-2xl font-black text-white mt-1">
              {stats?.unreadMessages || 0}
            </p>
          </div>
          <div className="p-3 bg-red-950/60 text-red-400 border border-red-900/50 rounded-xl shadow-red-glow-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Submissions & Recent Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Recent Submissions */}
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 p-6 shadow-dark-glass">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-950/60 rounded-lg text-emerald-400 border border-emerald-900/50">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Recent Submissions
              </h2>
            </div>
            <Link
              to="/admin/submissions"
              className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-dark-750/70">
            {stats?.recentSubmissions?.length > 0 ? (
              stats.recentSubmissions.map((sub) => (
                <div key={sub._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        sub.studentId?.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.studentId?.name || 'S')}&background=dc2626&color=fff`
                      }
                      alt={sub.studentId?.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-dark-700"
                    />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {sub.studentId?.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate font-mono">
                        {sub.assignmentId?.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Badge variant={sub.status === 'submitted' ? 'success' : 'warning'} size="sm">
                      {sub.status === 'submitted' ? 'Submitted' : 'Late'}
                    </Badge>
                    <span className="text-[10px] font-medium text-slate-500">
                      {sub.submittedAt ? format(new Date(sub.submittedAt), 'MMM d, h:mm a') : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">No submissions recorded yet.</p>
            )}
          </div>
        </div>

        {/* Recent Queries */}
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 p-6 shadow-dark-glass">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-950/60 rounded-lg text-amber-400 border border-amber-900/50">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Student Query Desk
              </h2>
            </div>
            <Link
              to="/admin/queries"
              className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
            >
              Manage Tickets <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-dark-750/70">
            {stats?.recentQueries?.length > 0 ? (
              stats.recentQueries.map((query) => (
                <div key={query._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-dark-800 text-amber-400 border border-dark-700 rounded-xl shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {query.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        By {query.studentId?.name || 'Student'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        query.status === 'open'
                          ? 'danger'
                          : query.status === 'in_progress'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {query.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-slate-500">No active student queries.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
