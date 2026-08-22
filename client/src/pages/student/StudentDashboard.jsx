import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import { SkeletonCard, SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  Layers,
  FileText,
  CheckCircle,
  Award,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Clock,
  ArrowRight,
  GraduationCap,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStudentStats = async () => {
    try {
      const res = await api.get('/stats/student');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentStats();
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
        <SkeletonTable rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Student Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden bg-dark-850/90 border border-dark-700/80 shadow-dark-glass">
        {/* Ambient glows */}
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-48 h-48 bg-red-900/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm uppercase tracking-wider">
                Roll: {user?.rollNumber || 'STU-NEW'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {user?.department || 'Computer Science'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="mt-1.5 text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
              Track your group assignments, review graded submissions, access lecture notes, and message your instructor directly.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/student/assignments"
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              View Assignments
            </Link>
            <Link
              to="/student/queries"
              className="px-4 py-2.5 bg-dark-800/90 hover:bg-dark-750 text-white font-bold rounded-xl text-xs sm:text-sm border border-dark-700 transition-all flex items-center gap-2 active:scale-95"
            >
              <HelpCircle className="w-4 h-4 text-red-400" />
              Ask Question
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Enrolled Groups"
          value={stats?.enrolledGroupsCount || 0}
          subtitle="Active study cohorts"
          icon={Layers}
          color="emerald"
        />
        <StatCard
          title="Total Assignments"
          value={stats?.totalAssignments || 0}
          subtitle={`${stats?.submittedAssignments || 0} submitted`}
          icon={FileText}
          color="brand"
        />
        <StatCard
          title="Pending Submissions"
          value={stats?.pendingAssignments || 0}
          subtitle="Tasks requiring submission"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Academic Score"
          value={`${stats?.averagePercentage || 0}%`}
          subtitle="Cumulative average"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Two Columns: Upcoming Assignments & Recent Marks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Assignments */}
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 p-6 shadow-dark-glass">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-black text-white">
                Upcoming Deadlines
              </h2>
            </div>
            <Link
              to="/student/assignments"
              className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
            >
              All Assignments <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-dark-750/70">
            {stats?.upcomingAssignments?.length > 0 ? (
              stats.upcomingAssignments.map((a) => (
                <div key={a._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm">
                      {a.subject}
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-white mt-1">
                      {a.title}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      Due: {format(new Date(a.dueDate), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>

                  <Link
                    to="/student/assignments"
                    className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 shadow-red-glow-sm transition-all shrink-0"
                  >
                    Submit Work
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                🎉 No upcoming pending assignments! You're all caught up.
              </div>
            )}
          </div>
        </div>

        {/* Recent Marks */}
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 p-6 shadow-dark-glass">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-black text-white">
                Recent Graded Assessments
              </h2>
            </div>
            <Link
              to="/student/marks"
              className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
            >
              Full Report <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-dark-750/70">
            {stats?.recentMarks?.length > 0 ? (
              stats.recentMarks.map((m) => (
                <div key={m._id} className="py-3.5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {m.assessmentName}
                    </p>
                    <p className="text-[11px] text-red-400 font-bold uppercase tracking-wide">
                      {m.subject}
                    </p>
                    {m.remarks && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5">
                        "{m.remarks}"
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-white">
                      {m.marksObtained}/{m.totalMarks}
                    </p>
                    <span className="text-[11px] font-extrabold text-emerald-400">
                      {Math.round((m.marksObtained / m.totalMarks) * 100)}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No marks recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes & Announcements */}
      <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 p-6 shadow-dark-glass">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-black text-white">
              Group Notes & Announcements
            </h2>
          </div>
          <Link
            to="/student/notes"
            className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline flex items-center gap-1"
          >
            All Materials <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats?.recentNotes?.length > 0 ? (
            stats.recentNotes.map((note) => (
              <div
                key={note._id}
                className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700/80 flex flex-col justify-between hover:border-red-500/30 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm">
                    {note.groupId?.groupName || 'Cohort'}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white mt-2">
                    {note.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {note.description || 'Lecture material and notes.'}
                  </p>
                </div>

                {note.fileUrl && (
                  <div className="mt-3 pt-2.5 border-t border-dark-750">
                    <a
                      href={note.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-red-400 hover:text-red-300 hover:underline"
                    >
                      Download Material / View Link →
                    </a>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 col-span-2 text-center py-6">
              No notes shared in your groups yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
