import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  BookOpen,
  Filter
} from 'lucide-react';

export const MarksManagement = () => {
  const { success, error } = useToast();

  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [stats, setStats] = useState({ totalAssessments: 0, averagePercentage: 0 });

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeMark, setActiveMark] = useState(null);
  const [markToDelete, setMarkToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [remarks, setRemarks] = useState('');

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/marks', {
        params: { search, subject: selectedSubject }
      });
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

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students', { params: { limit: 100 } });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMarks();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, selectedSubject]);

  const handleCreateMark = async (e) => {
    e.preventDefault();
    if (!studentId || !subject || !assessmentName || marksObtained === '') {
      error('Please complete all required fields.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/marks', {
        studentId,
        subject: subject.trim(),
        assessmentName: assessmentName.trim(),
        marksObtained: Number(marksObtained),
        totalMarks: Number(totalMarks),
        remarks: remarks.trim()
      });

      if (res.data.success) {
        success('Marks recorded successfully!');
        setIsCreateOpen(false);
        resetForm();
        fetchMarks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to record marks');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateMark = async (e) => {
    e.preventDefault();
    if (!activeMark) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/marks/${activeMark._id}`, {
        subject: subject.trim(),
        assessmentName: assessmentName.trim(),
        marksObtained: Number(marksObtained),
        totalMarks: Number(totalMarks),
        remarks: remarks.trim()
      });

      if (res.data.success) {
        success('Marks updated successfully!');
        setIsEditOpen(false);
        resetForm();
        fetchMarks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update marks');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMark = async () => {
    if (!markToDelete) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/marks/${markToDelete._id}`);
      if (res.data.success) {
        success('Mark record deleted successfully.');
        setMarkToDelete(null);
        fetchMarks();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete mark record');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (mark) => {
    setActiveMark(mark);
    setSubject(mark.subject);
    setAssessmentName(mark.assessmentName);
    setMarksObtained(mark.marksObtained);
    setTotalMarks(mark.totalMarks);
    setRemarks(mark.remarks || '');
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setStudentId('');
    setSubject('');
    setAssessmentName('');
    setMarksObtained('');
    setTotalMarks(100);
    setRemarks('');
    setActiveMark(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
              <Award className="w-6 h-6" />
            </div>
            Marks & Academic Grading
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Record evaluation marks for assignments, lab assessments, and midterms with personalized remarks.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Marks Record
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-dark-850/90 backdrop-blur-xl p-4 rounded-3xl border border-dark-700/80 shadow-dark-glass">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by student name, Gmail, subject or assessment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Filter by Subject..."
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-52 px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Marks Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : marks.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No marks records found"
          description="Record marks for your students to track their academic performance."
          actionText="Add Marks"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700/80 bg-dark-800/70 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Assessment</th>
                  <th className="px-6 py-4">Marks Obtained</th>
                  <th className="px-6 py-4">Score Grade</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-right">Actions</th>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              m.studentId?.profilePicture ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(m.studentId?.name || 'S')}&background=dc2626&color=fff`
                            }
                            alt={m.studentId?.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-dark-700"
                          />
                          <div>
                            <p className="font-bold text-white text-sm">
                              {m.studentId?.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {m.studentId?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-white">
                        {m.subject}
                      </td>

                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {m.assessmentName}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-black text-white text-sm">
                          {m.marksObtained}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">/{m.totalMarks}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[11px] font-black rounded-full border ${
                            pct >= 85
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                              : pct >= 65
                              ? 'bg-red-950/60 text-red-400 border-red-800/60 shadow-red-glow-sm'
                              : pct >= 40
                              ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                              : 'bg-rose-950/70 text-rose-400 border-rose-800/70'
                          }`}
                        >
                          {pct}%
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate font-medium">
                        {m.remarks || '—'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setMarkToDelete(m)}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MARK MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Student Assessment Marks"
        size="md"
      >
        <form onSubmit={handleCreateMark} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Student *
            </label>
            <select
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              <option value="">-- Choose a student --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Assessment Name *
              </label>
              <input
                type="text"
                required
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                placeholder="e.g. DSA Assignment 1 or Midterm Test"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Marks Obtained *
              </label>
              <input
                type="number"
                min="0"
                required
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                placeholder="85"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Marks *
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Teacher Remarks / Feedback
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Excellent algorithmic implementation; keep up the good work."
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-300 bg-dark-800 hover:bg-dark-750 rounded-xl border border-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-red-glow disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MARK MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Student Marks Record"
        size="md"
      >
        <form onSubmit={handleUpdateMark} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Assessment Name *
              </label>
              <input
                type="text"
                required
                value={assessmentName}
                onChange={(e) => setAssessmentName(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Marks Obtained *
              </label>
              <input
                type="number"
                min="0"
                required
                value={marksObtained}
                onChange={(e) => setMarksObtained(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Marks *
              </label>
              <input
                type="number"
                min="1"
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Teacher Remarks / Feedback
            </label>
            <textarea
              rows="3"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-300 bg-dark-800 hover:bg-dark-750 rounded-xl border border-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-red-glow disabled:opacity-50"
            >
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!markToDelete}
        onClose={() => setMarkToDelete(null)}
        onConfirm={handleDeleteMark}
        title="Delete Marks Record"
        message={`Are you sure you want to delete the mark record for ${markToDelete?.studentId?.name} in ${markToDelete?.subject}?`}
        confirmText="Delete Record"
        loading={actionLoading}
      />
    </div>
  );
};

export default MarksManagement;
