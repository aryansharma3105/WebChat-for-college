import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Award,
  FileCheck,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

export const MySubmissions = () => {
  const { error } = useToast();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMySubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/submissions/my');
      if (res.data.success) {
        setSubmissions(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-emerald-950/60 text-emerald-400 rounded-2xl border border-emerald-900/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <CheckCircle className="w-6 h-6" />
          </div>
          My Submission History & Evaluation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Track timestamps, uploaded files, links, grading status, and instructor feedback for your coursework.
        </p>
      </div>

      {/* Submissions Table */}
      {loading ? (
        <SkeletonTable rows={5} />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No submissions recorded yet"
          description="Submit assignments from the My Assignments tab to review submission history here."
        />
      ) : (
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700/80 bg-dark-800/70 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Assignment</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Submitted At</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Submitted Artifact</th>
                  <th className="px-6 py-4">Grade & Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-750/60 text-xs">
                {submissions.map((sub) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-dark-800/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-black text-white text-sm">
                      {sub.assignmentId?.title}
                    </td>

                    <td className="px-6 py-4 font-bold text-red-400 text-[11px] uppercase tracking-wide">
                      {sub.assignmentId?.subject}
                    </td>

                    <td className="px-6 py-4 text-[11px] text-slate-400">
                      {format(new Date(sub.submittedAt), 'MMM d, yyyy h:mm a')}
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={sub.status === 'submitted' ? 'success' : 'warning'} size="md">
                        {sub.status === 'submitted' ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            On-Time
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            Late
                          </>
                        )}
                      </Badge>
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
                        <span className="text-xs text-slate-500 italic">No file attached</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {sub.grade?.marks !== undefined && sub.grade.marks !== null ? (
                        <div>
                          <p className="font-black text-white text-sm">
                            {sub.grade.marks}/{sub.assignmentId?.totalMarks || 100}
                          </p>
                          {sub.grade.feedback && (
                            <p className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs">
                              "{sub.grade.feedback}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Evaluation in progress</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
