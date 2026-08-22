import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import {
  FileText,
  Plus,
  Calendar,
  Layers,
  Paperclip,
  Trash2,
  Edit2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

export const AssignmentManagement = () => {
  const { success, error } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Modals & Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [assignedGroup, setAssignedGroup] = useState('all');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments', {
        params: { search, groupId: selectedGroup }
      });
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchAssignments();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, selectedGroup]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!title || !subject || !dueDate) {
      error('Please complete all required fields');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subject.trim());
      formData.append('assignedGroup', assignedGroup === 'all' ? '' : assignedGroup);
      formData.append('dueDate', dueDate);
      formData.append('totalMarks', totalMarks);

      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      } else if (attachmentUrl) {
        formData.append('attachmentUrl', attachmentUrl.trim());
      }

      const res = await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        success('Assignment created successfully!');
        setIsCreateOpen(false);
        resetForm();
        fetchAssignments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!activeAssignment) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subject.trim());
      formData.append('assignedGroup', assignedGroup === 'all' ? '' : assignedGroup);
      formData.append('dueDate', dueDate);
      formData.append('totalMarks', totalMarks);

      if (attachmentFile) {
        formData.append('attachment', attachmentFile);
      }

      const res = await api.put(`/assignments/${activeAssignment._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        success('Assignment updated successfully!');
        setIsEditOpen(false);
        resetForm();
        fetchAssignments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/assignments/${assignmentToDelete._id}`);
      if (res.data.success) {
        success('Assignment deleted successfully.');
        setAssignmentToDelete(null);
        fetchAssignments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete assignment');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (assignment) => {
    setActiveAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description || '');
    setSubject(assignment.subject);
    setAssignedGroup(assignment.assignedGroup?._id || 'all');
    setDueDate(format(new Date(assignment.dueDate), "yyyy-MM-dd'T'HH:mm"));
    setTotalMarks(assignment.totalMarks || 100);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject('');
    setAssignedGroup('all');
    setDueDate('');
    setTotalMarks(100);
    setAttachmentFile(null);
    setAttachmentUrl('');
    setActiveAssignment(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
              <FileText className="w-6 h-6" />
            </div>
            Assignment Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish course tasks, assign deadlines, attach guideline documents, and track student completion.
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
          Create Assignment
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-dark-850/90 backdrop-blur-xl p-4 rounded-3xl border border-dark-700/80 shadow-dark-glass">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search assignments by title or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
          >
            <option value="">All Cohorts / Classes</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.groupName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignment List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments created"
          description="Create assignments for your student cohorts with deadlines and document attachments."
          actionText="Create First Assignment"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => {
            const isPastDue = new Date() > new Date(a.dueDate);
            return (
              <div
                key={a._id}
                className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 hover:border-red-500/40 p-6 shadow-dark-glass hover:shadow-red-glow transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm uppercase tracking-wider">
                      {a.subject}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(a)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setAssignmentToDelete(a)}
                        className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {a.description || 'No additional instructions provided for this assignment.'}
                  </p>

                  {/* Metadata info */}
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>
                        Due: <span className="font-semibold text-white">{format(new Date(a.dueDate), 'MMM d, yyyy h:mm a')}</span>
                      </span>
                      {isPastDue && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-950/70 border border-red-800/60 px-1.5 py-0.5 rounded">
                          Closed
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Target:{' '}
                        <span className="font-semibold text-white">
                          {a.assignedGroup?.groupName || 'All Students'}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Total Marks: <span className="font-semibold text-white">{a.totalMarks || 100}</span>
                      </span>
                    </div>

                    {a.attachment?.url && (
                      <div className="flex items-center gap-2 pt-1">
                        <Paperclip className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <a
                          href={a.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-red-400 hover:text-red-300 hover:underline truncate max-w-xs flex items-center gap-1"
                        >
                          {a.attachment.filename || 'View Attached Resource'}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Progress Strip */}
                <div className="mt-6 pt-4 border-t border-dark-750">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-900/50 rounded-2xl">
                      <p className="text-[10px] font-extrabold text-emerald-400 uppercase">Submitted</p>
                      <p className="text-sm font-black text-white mt-0.5">
                        {a.stats?.submitted || 0}
                      </p>
                    </div>
                    <div className="p-2.5 bg-amber-950/40 border border-amber-900/50 rounded-2xl">
                      <p className="text-[10px] font-extrabold text-amber-400 uppercase">Late</p>
                      <p className="text-sm font-black text-white mt-0.5">
                        {a.stats?.late || 0}
                      </p>
                    </div>
                    <div className="p-2.5 bg-dark-800 border border-dark-700 rounded-2xl">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase">Pending</p>
                      <p className="text-sm font-black text-white mt-0.5">
                        {a.stats?.pending || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Assignment"
        size="lg"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DSA Lab 03: AVL Tree Rotations"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

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
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Requirements
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline assignment objectives, submission constraints, and guidelines..."
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Assigned Group
              </label>
              <select
                value={assignedGroup}
                onChange={(e) => setAssignedGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              >
                <option value="all">All Enrolled Students</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.groupName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Marks
              </label>
              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2 pt-2">
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
              Attach Resource Document (PDF, ZIP, DOCX)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-dark-800 file:text-red-400 file:border file:border-dark-700 hover:file:bg-dark-750"
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
              {actionLoading ? 'Publishing...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT ASSIGNMENT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Assignment"
        size="lg"
      >
        <form onSubmit={handleUpdateAssignment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Assignment Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

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
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Description & Requirements
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Assigned Group
              </label>
              <select
                value={assignedGroup}
                onChange={(e) => setAssignedGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              >
                <option value="all">All Enrolled Students</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.groupName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Due Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Total Marks
              </label>
              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
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

      {/* Delete Assignment Confirmation */}
      <ConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleDeleteAssignment}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${assignmentToDelete?.title}"? All student submissions will also be deleted.`}
        confirmText="Delete Assignment"
        loading={actionLoading}
      />
    </div>
  );
};

export default AssignmentManagement;
