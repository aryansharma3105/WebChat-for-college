import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  HelpCircle,
  Plus,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  User,
  Search
} from 'lucide-react';
import { format } from 'date-fns';

export const MyQueries = () => {
  const { success, error } = useToast();

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  // Form states
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [relatedCourse, setRelatedCourse] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyQueries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/queries');
      if (res.data.success) {
        setQueries(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching queries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQueries();
  }, []);

  const handleCreateQuery = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      error('Please provide a subject and description.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post('/queries', {
        subject: subject.trim(),
        message: message.trim(),
        priority,
        relatedCourse: relatedCourse.trim()
      });

      if (res.data.success) {
        success('Query submitted to instructor successfully!');
        setIsCreateOpen(false);
        setSubject('');
        setMessage('');
        setRelatedCourse('');
        fetchMyQueries();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to submit query');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenThread = async (query) => {
    try {
      const res = await api.get(`/queries/${query._id}`);
      if (res.data.success) {
        setSelectedQuery(res.data.data);
        setReplyMessage('');
        setIsThreadOpen(true);
      }
    } catch (err) {
      error('Failed to load query thread');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.post(`/queries/${selectedQuery._id}/reply`, {
        message: replyMessage.trim()
      });

      if (res.data.success) {
        success('Reply sent!');
        setSelectedQuery(res.data.data);
        setReplyMessage('');
        fetchMyQueries();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to send reply');
    } finally {
      setActionLoading(false);
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
            Academic Help & Query Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit questions to your instructor regarding assignments, lecture topics, or grading.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          New Academic Query
        </button>
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          All questions and communication remain strictly within the university portal. Your instructor will reply directly to your ticket.
        </p>
      </div>

      {/* Queries List */}
      {loading ? (
        <SkeletonTable rows={4} />
      ) : queries.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No queries submitted"
          description="Have questions about coursework or lab assignments? Submit a query to your instructor."
          actionText="Submit First Query"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden divide-y divide-dark-750/70">
          {queries.map((q) => (
            <div
              key={q._id}
              onClick={() => handleOpenThread(q)}
              className="p-5 hover:bg-dark-800/60 cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-bold text-white">
                    {q.subject}
                  </h3>
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

                <p className="text-[11px] text-slate-500">
                  Submitted {format(new Date(q.createdAt), 'MMM d, yyyy h:mm a')} •{' '}
                  <span className="font-bold text-red-400">
                    {q.responses?.length || 0} response(s)
                  </span>
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenThread(q);
                }}
                className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 shadow-red-glow-sm transition-all shrink-0"
              >
                View Thread
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CREATE QUERY MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Submit Academic Inquiry / Query"
        size="md"
      >
        <form onSubmit={handleCreateQuery} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Subject *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Trouble understanding Assignment 2 AVL rotations"
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Related Course / Subject
              </label>
              <input
                type="text"
                value={relatedCourse}
                onChange={(e) => setRelatedCourse(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              >
                <option value="low">Low (General question)</option>
                <option value="medium">Medium (Course concept)</option>
                <option value="high">High (Upcoming deadline)</option>
                <option value="urgent">Urgent (Submission issue)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Detailed Question / Message *
            </label>
            <textarea
              rows="4"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what you are trying to solve, where you are stuck, or questions regarding notes/assignment..."
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
              {actionLoading ? 'Submitting...' : 'Submit Query'}
            </button>
          </div>
        </form>
      </Modal>

      {/* THREAD VIEW MODAL */}
      {selectedQuery && (
        <Modal
          isOpen={isThreadOpen}
          onClose={() => setIsThreadOpen(false)}
          title={`Query: ${selectedQuery.subject}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Original question card */}
            <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700">
              <div className="flex items-center justify-between mb-2">
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
                <span className="text-xs text-slate-500">
                  {format(new Date(selectedQuery.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed mt-2">
                {selectedQuery.message}
              </p>
            </div>

            {/* Responses List */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Responses ({selectedQuery.responses?.length || 0})
              </h4>

              {selectedQuery.responses?.length > 0 ? (
                selectedQuery.responses.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs ${
                      r.senderRole === 'admin'
                        ? 'bg-red-950/40 border-red-900/50 ml-4'
                        : 'bg-dark-800/90 border-dark-700 mr-4'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        {r.senderRole === 'admin' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                            Instructor Reply
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 text-emerald-400" />
                            You
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
                ))
              ) : (
                <p className="text-xs text-slate-500 italic py-2">
                  No responses yet. Your instructor has been notified.
                </p>
              )}
            </div>

            {/* Follow-up reply input */}
            <form onSubmit={handleSendReply} className="space-y-3 pt-3 border-t border-dark-750">
              <textarea
                rows="2"
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Post a follow-up reply or clarification..."
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />

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
                  disabled={actionLoading || !replyMessage.trim()}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl flex items-center gap-1.5 shadow-red-glow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {actionLoading ? 'Sending...' : 'Post Reply'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyQueries;
