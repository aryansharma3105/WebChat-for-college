import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Link as LinkIcon,
  Bell,
  Trash2,
  Edit2,
  ExternalLink,
  Download,
  Layers,
  File
} from 'lucide-react';
import { format } from 'date-fns';

export const NotesManagement = () => {
  const { success, error } = useToast();

  const [notes, setNotes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Modals & Dialogs
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [externalLink, setExternalLink] = useState('');
  const [noteFile, setNoteFile] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notes', {
        params: { search, groupId: selectedGroup }
      });
      if (res.data.success) {
        setNotes(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      if (res.data.success) {
        setGroups(res.data.data);
        if (res.data.data.length > 0 && !groupId) {
          setGroupId(res.data.data[0]._id);
        }
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
      fetchNotes();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, selectedGroup]);

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!title.trim() || !groupId) {
      error('Title and Group selection are required.');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('groupId', groupId);
      formData.append('isAnnouncement', isAnnouncement);
      if (externalLink) formData.append('externalLink', externalLink.trim());
      if (noteFile) formData.append('noteFile', noteFile);

      const res = await api.post('/notes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        success(isAnnouncement ? 'Announcement posted successfully!' : 'Study material shared successfully!');
        setIsCreateOpen(false);
        resetForm();
        fetchNotes();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to share notes');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!activeNote) return;

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('groupId', groupId);
      formData.append('isAnnouncement', isAnnouncement);
      if (externalLink) formData.append('externalLink', externalLink.trim());
      if (noteFile) formData.append('noteFile', noteFile);

      const res = await api.put(`/notes/${activeNote._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        success('Note updated successfully!');
        setIsEditOpen(false);
        resetForm();
        fetchNotes();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/notes/${noteToDelete._id}`);
      if (res.data.success) {
        success('Material deleted successfully.');
        setNoteToDelete(null);
        fetchNotes();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete note');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (note) => {
    setActiveNote(note);
    setTitle(note.title);
    setDescription(note.description || '');
    setGroupId(note.groupId?._id || '');
    setIsAnnouncement(note.isAnnouncement);
    setExternalLink(note.externalLink || '');
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setGroupId(groups[0]?._id || '');
    setIsAnnouncement(false);
    setExternalLink('');
    setNoteFile(null);
    setActiveNote(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            Notes & Study Materials
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish lecture notes, PDFs, code references, and cohort announcements. Students have read-only access.
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
          Share Material
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-dark-850/90 backdrop-blur-xl p-4 rounded-3xl border border-dark-700/80 shadow-dark-glass">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes and announcements by title or content..."
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
            <option value="">All Cohorts</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.groupName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study materials or announcements"
          description="Upload PDFs, lecture slides, or post announcements for your groups."
          actionText="Share First Note"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className={`rounded-3xl border p-6 shadow-dark-glass hover:shadow-red-glow transition-all duration-300 flex flex-col justify-between backdrop-blur-xl ${
                note.isAnnouncement
                  ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-500/50'
                  : 'bg-dark-850/90 border-dark-700/80 hover:border-red-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {note.isAnnouncement ? (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60 shadow-[0_0_10px_rgba(245,158,11,0.15)] uppercase tracking-wider">
                        <Bell className="w-3 h-3" /> Announcement
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm uppercase tracking-wider">
                        <FileText className="w-3 h-3" /> Study Resource
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(note)}
                      className="p-1 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setNoteToDelete(note)}
                      className="p-1 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {note.description || 'No description provided.'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span className="font-bold text-slate-200">
                      {note.groupId?.groupName || 'Target Cohort'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Posted on {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Attachment link / preview */}
              <div className="mt-5 pt-3 border-t border-dark-750 flex items-center justify-between">
                {note.fileUrl ? (
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:underline max-w-[200px] truncate"
                  >
                    {note.fileType === 'link' ? (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        Open Web Link
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        {note.fileName || 'Download Resource'}
                      </>
                    )}
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">Notice only</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE NOTE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Share Notes or Announcement"
        size="md"
      >
        <form onSubmit={handleCreateNote} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Lecture 05: Dynamic Programming Notes"
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Target Cohort *
            </label>
            <select
              required
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.groupName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Content / Details
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a summary or key lecture topics..."
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-red-950/40 rounded-xl border border-red-900/50 shadow-inner-red">
            <input
              type="checkbox"
              id="isAnnounce"
              checked={isAnnouncement}
              onChange={(e) => setIsAnnouncement(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-dark-800 border-dark-700"
            />
            <label htmlFor="isAnnounce" className="text-xs font-bold text-red-200 cursor-pointer">
              Mark as Priority Cohort Announcement
            </label>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              External Reference Link (Optional)
            </label>
            <input
              type="url"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://docs.oracle.com/..."
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Upload PDF or Document (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => setNoteFile(e.target.files[0])}
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
              {actionLoading ? 'Sharing...' : 'Share with Cohort'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT NOTE MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Note / Announcement"
        size="md"
      >
        <form onSubmit={handleUpdateNote} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Title *
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
              Target Cohort *
            </label>
            <select
              required
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.groupName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Content / Details
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 p-3 bg-red-950/40 rounded-xl border border-red-900/50 shadow-inner-red">
            <input
              type="checkbox"
              id="isAnnounceEdit"
              checked={isAnnouncement}
              onChange={(e) => setIsAnnouncement(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-dark-800 border-dark-700"
            />
            <label htmlFor="isAnnounceEdit" className="text-xs font-bold text-red-200 cursor-pointer">
              Mark as Priority Cohort Announcement
            </label>
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
        isOpen={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteNote}
        title="Delete Study Material"
        message={`Are you sure you want to delete "${noteToDelete?.title}"?`}
        confirmText="Delete Material"
        loading={actionLoading}
      />
    </div>
  );
};

export default NotesManagement;
