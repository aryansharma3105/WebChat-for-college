import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import {
  FileText,
  Calendar,
  Layers,
  Paperclip,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Upload,
  Send,
  Award
} from 'lucide-react';
import { format } from 'date-fns';

export const MyAssignments = () => {
  const { success, error } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Modal
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [comments, setComments] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/assignments');
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenSubmit = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionLink(assignment.mySubmission?.submissionLink || '');
    setComments(assignment.mySubmission?.comments || '');
    setSubmissionFile(null);
    setIsSubmitOpen(true);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionFile && !submissionLink.trim()) {
      error('Please upload a file or provide a submission link.');
      return;
    }

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      if (submissionFile) {
        formData.append('submissionFile', submissionFile);
      }
      if (submissionLink) {
        formData.append('submissionLink', submissionLink.trim());
      }
      if (comments) {
        formData.append('comments', comments.trim());
      }

      const res = await api.post(`/submissions/${selectedAssignment._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        success(res.data.message || 'Assignment submitted successfully!');
        setIsSubmitOpen(false);
        fetchAssignments();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
            <FileText className="w-6 h-6" />
          </div>
          My Course Assignments
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          View assigned coursework, review deadlines, and submit files or external repository links.
        </p>
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
          title="No assignments assigned"
          description="There are currently no active assignments for your enrolled groups."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((a) => {
            const hasSubmitted = !!a.mySubmission;
            const isLate = a.mySubmission?.status === 'late';
            const isOverdue = a.userStatus === 'overdue';

            return (
              <div
                key={a._id}
                className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 p-6 shadow-dark-glass hover:border-red-500/40 hover:shadow-red-glow transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 shadow-red-glow-sm uppercase tracking-wider">
                      {a.subject}
                    </span>

                    {hasSubmitted ? (
                      <Badge variant={isLate ? 'warning' : 'success'} size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isLate ? 'Submitted Late' : 'Submitted'}
                      </Badge>
                    ) : isOverdue ? (
                      <Badge variant="danger" size="md">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Overdue
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="md">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-black text-white mb-2 leading-snug">
                    {a.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                    {a.description || 'Complete and submit according to class instructions.'}
                  </p>

                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>
                        Due: <span className="font-bold text-white">{format(new Date(a.dueDate), 'MMM d, yyyy h:mm a')}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Max Marks: {a.totalMarks || 100}</span>
                    </div>

                    {a.attachment?.url && (
                      <div className="flex items-center gap-2 pt-1">
                        <Paperclip className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <a
                          href={a.attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-red-400 hover:text-red-300 hover:underline truncate max-w-xs flex items-center gap-1"
                        >
                          {a.attachment.filename || 'Instructions Attachment'}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Submission Details Banner if already submitted */}
                  {hasSubmitted && (
                    <div className="mt-4 p-3 rounded-2xl bg-dark-800/90 border border-dark-700 text-xs">
                      <p className="font-bold text-white flex items-center justify-between">
                        <span>Submitted on {format(new Date(a.mySubmission.submittedAt), 'MMM d, h:mm a')}</span>
                        {a.mySubmission.grade?.marks !== undefined && a.mySubmission.grade?.marks !== null && (
                          <span className="text-emerald-400 font-extrabold text-sm">
                            Grade: {a.mySubmission.grade.marks}/{a.totalMarks}
                          </span>
                        )}
                      </p>

                      {a.mySubmission.grade?.feedback && (
                        <p className="text-[11px] text-slate-400 italic mt-1.5">
                          Feedback: "{a.mySubmission.grade.feedback}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="mt-6 pt-4 border-t border-dark-750 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenSubmit(a)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {hasSubmitted ? 'Resubmit / Edit Work' : 'Submit Assignment'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMISSION MODAL */}
      {selectedAssignment && (
        <Modal
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          title={`Submit: ${selectedAssignment.title}`}
          size="md"
        >
          <form onSubmit={handleSubmitWork} className="space-y-4">
            <div className="p-4 bg-dark-800/90 rounded-2xl border border-dark-700">
              <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Assignment Info</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {selectedAssignment.title} ({selectedAssignment.subject})
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Deadline: {format(new Date(selectedAssignment.dueDate), 'MMM d, yyyy h:mm a')}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Option 1: Upload Submission File (ZIP, PDF, DOCX, Code)
              </label>
              <input
                type="file"
                onChange={(e) => setSubmissionFile(e.target.files[0])}
                className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-dark-800 file:text-red-400 file:border file:border-dark-700 hover:file:bg-dark-750"
              />
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-dark-700"></div>
              <span className="flex-shrink mx-3 text-[10px] font-extrabold text-slate-500 uppercase">OR</span>
              <div className="flex-grow border-t border-dark-700"></div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Option 2: Submission Link (GitHub / Google Drive)
              </label>
              <input
                type="url"
                value={submissionLink}
                onChange={(e) => setSubmissionLink(e.target.value)}
                placeholder="https://github.com/your-username/assignment-repo"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Student Notes / Comments (Optional)
              </label>
              <textarea
                rows="2"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Any execution notes, test commands, or references..."
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-300 bg-dark-800 hover:bg-dark-750 rounded-xl border border-dark-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-red-glow disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {submitLoading ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MyAssignments;
