import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  CheckCircle,
  Search,
  Filter,
  ExternalLink,
  Clock,
  AlertCircle,
  Award,
  FileCheck,
  Calendar,
  Layers,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

export const SubmissionStatus = () => {
  const { success, error } = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0, submitted: 0, late: 0, pending: 0 });

  // Grading Modal
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isGradeOpen, setIsGradeOpen] = useState(false);
  const [gradeMarks, setGradeMarks] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [gradeLoading, setGradeLoading] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions', {
        params: {
          assignmentId: selectedAssignment,
          groupId: selectedGroup,
          status: selectedStatus,
          search
        }
      });
      if (res.data.success) {
        setSubmissions(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [assignRes, groupRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/groups')
      ]);
      if (assignRes.data.success) setAssignments(assignRes.data.data);
      if (groupRes.data.success) setGroups(groupRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchSubmissions();
    }, 300);
    return () => clearTimeout(delay);
  }, [selectedAssignment, selectedGroup, selectedStatus, search]);

  const handleOpenGradeModal = (sub) => {
    setSelectedSubmission(sub);
    setGradeMarks(sub.grade?.marks !== undefined ? sub.grade.marks : '');
    setGradeFeedback(sub.grade?.feedback || '');
    setIsGradeOpen(true);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmission || selectedSubmission._id.startsWith('pending-')) {
      error('Cannot grade a pending/unsubmitted assignment.');
      return;
    }

    setGradeLoading(true);
    try {
      const res = await api.put(`/submissions/${selectedSubmission._id}/grade`, {
        marks: Number(gradeMarks),
        feedback: gradeFeedback.trim()
      });

      if (res.data.success) {
        success('Grade and feedback saved successfully!');
        setIsGradeOpen(false);
        fetchSubmissions();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record grade');
    } finally {
      setGradeLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-2xl border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CheckCircle className="w-6 h-6" />
          </div>
          Submission Compliance Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor student submission compliance across cohorts, review attached files or links, and award marks.
        </p>
      </div>

      {/* Summary Filter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            selectedStatus === 'all'
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-red-glow'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-red-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">All Records</p>
          <p className="text-2xl font-black mt-1">{stats.total || 0}</p>
        </button>

        <button
          onClick={() => setSelectedStatus('submitted')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            selectedStatus === 'submitted'
              ? 'bg-emerald-600 text-white border-transparent shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-emerald-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Submitted</p>
          <p className="text-2xl font-black mt-1 text-emerald-400">
            {stats.submitted || 0}
          </p>
        </button>

        <button
          onClick={() => setSelectedStatus('late')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            selectedStatus === 'late'
              ? 'bg-amber-600 text-white border-transparent shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-amber-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">Late Submission</p>
          <p className="text-2xl font-black mt-1 text-amber-400">
            {stats.late || 0}
          </p>
        </button>

        <button
          onClick={() => setSelectedStatus('pending')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            selectedStatus === 'pending'
              ? 'bg-rose-600 text-white border-transparent shadow-red-glow'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-red-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">Not Submitted</p>
          <p className="text-2xl font-black mt-1 text-red-400">
            {stats.pending || 0}
          </p>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-dark-850/90 backdrop-blur-xl p-4 rounded-3xl border border-dark-700/80 shadow-dark-glass">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search student name or Gmail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div>
          <select
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
          >
            <option value="">Filter by Assignment (All)</option>
            {assignments.map((a) => (
              <option key={a._id} value={a._id}>
                {a.title} ({a.subject})
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
          >
            <option value="">Filter by Cohort (All)</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.groupName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <SkeletonTable rows={7} />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No submission records match your filter"
          description="Adjust your search keywords or filter settings."
        />
      ) : (
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700/80 bg-dark-800/70 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted Time</th>
                  <th className="px-6 py-4">Submission Resource</th>
                  <th className="px-6 py-4">Marks / Grade</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-750/60 text-xs">
                {submissions.map((sub) => {
                  const isPending = sub.status === 'pending';
                  return (
                    <tr
                      key={sub._id}
                      className="hover:bg-dark-800/60 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              sub.studentId?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.studentId?.name || 'S')}&background=dc2626&color=fff`
                            }
                            alt={sub.studentId?.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-dark-700"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-white text-sm">
                              {sub.studentId?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {sub.studentId?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-bold text-white">
                          {sub.assignmentId?.title}
                        </p>
                        <p className="text-[10px] text-red-300 font-semibold uppercase">
                          {sub.assignmentId?.subject}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        {sub.status === 'submitted' && (
                          <Badge variant="success" size="md">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Submitted
                          </Badge>
                        )}
                        {sub.status === 'late' && (
                          <Badge variant="warning" size="md">
                            <Clock className="w-3.5 h-3.5" />
                            Late Submission
                          </Badge>
                        )}
                        {sub.status === 'pending' && (
                          <Badge variant="danger" size="md">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Not Submitted
                          </Badge>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {sub.submittedAt ? (
                          format(new Date(sub.submittedAt), 'MMM d, yyyy h:mm a')
                        ) : (
                          <span className="text-slate-500 italic">Pending</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {sub.fileUrl ? (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:underline max-w-xs truncate"
                          >
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            {sub.fileName || 'View Submission'}
                          </a>
                        ) : (
                          <span className="text-xs text-slate-500 italic">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {sub.grade?.marks !== undefined && sub.grade.marks !== null ? (
                          <span className="font-black text-white text-sm">
                            {sub.grade.marks}/{sub.assignmentId?.totalMarks || 100}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Not Graded</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {!isPending && (
                          <button
                            onClick={() => handleOpenGradeModal(sub)}
                            className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 shadow-red-glow-sm transition-all"
                          >
                            {sub.grade?.marks !== undefined ? 'Edit Grade' : 'Grade'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={isGradeOpen}
          onClose={() => setIsGradeOpen(false)}
          title="Grade Assignment Submission"
          size="md"
        >
          <form onSubmit={handleSaveGrade} className="space-y-4">
            <div className="p-4 bg-dark-800/90 rounded-2xl border border-dark-700">
              <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Student Candidate</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {selectedSubmission.studentId?.name} ({selectedSubmission.studentId?.email})
              </p>
              <p className="text-xs text-slate-300 mt-2 font-medium">
                Assignment: <span className="text-red-400 font-bold">{selectedSubmission.assignmentId?.title}</span>
              </p>
              {selectedSubmission.fileUrl && (
                <a
                  href={selectedSubmission.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Submitted Work / Link
                </a>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Marks Awarded (Out of {selectedSubmission.assignmentId?.totalMarks || 100}) *
              </label>
              <input
                type="number"
                min="0"
                max={selectedSubmission.assignmentId?.totalMarks || 100}
                required
                value={gradeMarks}
                onChange={(e) => setGradeMarks(e.target.value)}
                placeholder="e.g. 85"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Evaluation Feedback & Remarks
              </label>
              <textarea
                rows="3"
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Constructive feedback, evaluation criteria remarks, or points breakdown..."
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsGradeOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-300 bg-dark-800 hover:bg-dark-750 rounded-xl border border-dark-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={gradeLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-red-glow disabled:opacity-50"
              >
                {gradeLoading ? 'Saving...' : 'Record Grade'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SubmissionStatus;
