import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  HelpCircle,
  Search,
  Filter,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  User,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

export const StudentQueries = () => {
  const { success, error } = useToast();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });

  // Query Thread Modal
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [targetStatus, setTargetStatus] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Deletion states
  const [queryToDelete, setQueryToDelete] = useState(null);
  const [isClearAllOpen, setIsClearAllOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/queries', {
        params: { search, status: statusFilter }
      });
      if (res.data.success) {
        setQueries(res.data.data);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error loading student queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchQueries();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  const handleOpenThread = async (query) => {
    try {
      const res = await api.get(`/queries/${query._id}`);
      if (res.data.success) {
        setSelectedQuery(res.data.data);
        setTargetStatus(res.data.data.status);
        setReplyMessage('');
        setIsThreadOpen(true);
      }
    } catch (err) {
      error('Failed to load query details');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() && targetStatus === selectedQuery?.status) {
      error('Please enter a response or change status.');
      return;
    }

    setReplyLoading(true);
    try {
      if (replyMessage.trim()) {
        const res = await api.post(`/queries/${selectedQuery._id}/reply`, {
          message: replyMessage.trim(),
          status: targetStatus
        });
        if (res.data.success) {
          success('Response sent to student successfully!');
          setSelectedQuery(res.data.data);
          setReplyMessage('');
          fetchQueries();
        }
      } else if (targetStatus !== selectedQuery.status) {
        const res = await api.put(`/queries/${selectedQuery._id}/status`, {
          status: targetStatus
        });
        if (res.data.success) {
          success(`Query status updated to ${targetStatus}`);
          setSelectedQuery(res.data.data);
          fetchQueries();
        }
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to post reply');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDeleteQuery = async () => {
    if (!queryToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/queries/${queryToDelete._id}`);
      if (res.data.success) {
        success('Query ticket deleted successfully.');
        setQueryToDelete(null);
        setIsThreadOpen(false);
        fetchQueries();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete query');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClearAllQueries = async () => {
    setDeleteLoading(true);
    try {
      const res = await api.delete('/queries/clear/all');
      if (res.data.success) {
        success(res.data.message || 'All queries cleared successfully.');
        setIsClearAllOpen(false);
        fetchQueries();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to clear queries');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
              <HelpCircle className="w-6 h-6" />
            </div>
            Student Query Desk & Support
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Academic support inquiries and tickets submitted by students. Respond directly or remove tickets anytime.
          </p>
        </div>

        {queries.length > 0 && (
          <button
            onClick={() => setIsClearAllOpen(true)}
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 shadow-red-glow-sm transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Queries
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            statusFilter === ''
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-transparent shadow-red-glow'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-red-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">All Queries</p>
          <p className="text-2xl font-black mt-1">{stats.total || 0}</p>
        </button>

        <button
          onClick={() => setStatusFilter('open')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            statusFilter === 'open'
              ? 'bg-rose-600 text-white border-transparent shadow-red-glow'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-red-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-400">Open Tickets</p>
          <p className="text-2xl font-black mt-1 text-red-400">
            {stats.open || 0}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            statusFilter === 'in_progress'
              ? 'bg-amber-600 text-white border-transparent shadow-[0_0_20px_rgba(245,158,11,0.3)]'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-amber-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">In Progress</p>
          <p className="text-2xl font-black mt-1 text-amber-400">
            {stats.inProgress || 0}
          </p>
        </button>

        <button
          onClick={() => setStatusFilter('resolved')}
          className={`p-4 rounded-3xl border text-left transition-all ${
            statusFilter === 'resolved'
              ? 'bg-emerald-600 text-white border-transparent shadow-[0_0_20px_rgba(16,185,129,0.3)]'
              : 'bg-dark-850/90 border-dark-700/80 hover:border-emerald-500/40 text-slate-300'
          }`}
        >
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Resolved</p>
          <p className="text-2xl font-black mt-1 text-emerald-400">
            {stats.resolved || 0}
          </p>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-dark-850/90 backdrop-blur-xl p-4 rounded-3xl border border-dark-700/80 shadow-dark-glass">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search queries by subject, student name, or message content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Queries List */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : queries.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No queries found"
          description="All student questions have been addressed or no tickets match the filter."
        />
      ) : (
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden divide-y divide-dark-750/70">
          {queries.map((q) => (
            <div
              key={q._id}
              onClick={() => handleOpenThread(q)}
              className="p-5 hover:bg-dark-800/60 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <img
                  src={
                    q.studentId?.profilePicture ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(q.studentId?.name || 'S')}&background=dc2626&color=fff`
                  }
                  alt={q.studentId?.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-dark-700"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-white text-sm">
                      {q.subject}
                    </span>
                    <Badge
                      variant={
                        q.status === 'open'
                          ? 'danger'
                          : q.status === 'in_progress'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    >
                      {q.status.replace('_', ' ')}
                    </Badge>
                    {q.relatedCourse && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-dark-800 border border-dark-700 text-slate-300">
                        {q.relatedCourse}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    {q.message}
                  </p>

                  <p className="text-[10px] text-slate-500 mt-1">
                    From <span className="font-bold text-slate-300">{q.studentId?.name}</span> ({q.studentId?.email}) •{' '}
                    {format(new Date(q.createdAt), 'MMM d, h:mm a')} •{' '}
                    <span className="text-red-400 font-bold">
                      {q.responses?.length || 0} replies
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenThread(q);
                  }}
                  className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 shadow-red-glow-sm transition-all"
                >
                  Open Thread
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setQueryToDelete(q);
                  }}
                  title="Delete Query"
                  className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-xl border border-transparent hover:border-red-800/60 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QUERY THREAD MODAL */}
      {selectedQuery && (
        <Modal
          isOpen={isThreadOpen}
          onClose={() => setIsThreadOpen(false)}
          title={`Query: ${selectedQuery.subject}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Student Info & Original Message */}
            <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      selectedQuery.studentId?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedQuery.studentId?.name || 'S')}&background=dc2626&color=fff`
                    }
                    alt={selectedQuery.studentId?.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-dark-700"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">
                      {selectedQuery.studentId?.name}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">
                      {selectedQuery.studentId?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedQuery.status === 'open'
                        ? 'danger'
                        : selectedQuery.status === 'in_progress'
                        ? 'warning'
                        : 'success'
                    }
                    size="md"
                  >
                    {selectedQuery.status.replace('_', ' ')}
                  </Badge>
                  <button
                    type="button"
                    onClick={() => setQueryToDelete(selectedQuery)}
                    title="Delete Ticket"
                    className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg border border-red-900/40 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-dark-900/90 rounded-xl border border-dark-750 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedQuery.message}
              </div>
            </div>

            {/* Conversation Responses */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Thread Replies ({selectedQuery.responses?.length || 0})
              </h4>

              {selectedQuery.responses?.map((r, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-xs ${
                    r.senderRole === 'admin'
                      ? 'bg-red-950/40 border-red-900/50 ml-4 shadow-inner-red'
                      : 'bg-dark-800/90 border-dark-700 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      {r.senderRole === 'admin' ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                          Teacher Response
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          {r.senderName || 'Student'}
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {format(new Date(r.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {r.message}
                  </p>
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="space-y-4 pt-3 border-t border-dark-750">
              <div className="flex items-center gap-3">
                <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">
                  Update Ticket Status:
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="px-3 py-1.5 bg-dark-800 border border-dark-700 rounded-xl text-xs font-bold text-white focus:outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <textarea
                  rows="3"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write an internal reply to student..."
                  className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsThreadOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-300 bg-dark-800 hover:bg-dark-750 rounded-xl border border-dark-700"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl flex items-center gap-1.5 shadow-red-glow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {replyLoading ? 'Sending...' : 'Send Reply & Update'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Delete Single Query Dialog */}
      <ConfirmDialog
        isOpen={!!queryToDelete}
        onClose={() => setQueryToDelete(null)}
        onConfirm={handleDeleteQuery}
        title="Delete Query Ticket"
        message={`Are you sure you want to delete the query "${queryToDelete?.subject}" from ${queryToDelete?.studentId?.name}?`}
        confirmText="Delete Ticket"
        loading={deleteLoading}
      />

      {/* Clear All Queries Dialog */}
      <ConfirmDialog
        isOpen={isClearAllOpen}
        onClose={() => setIsClearAllOpen(false)}
        onConfirm={handleClearAllQueries}
        title="Clear All Student Queries"
        message="Are you sure you want to permanently delete all student queries and replies? This action cannot be undone."
        confirmText="Clear All Queries"
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentQueries;
