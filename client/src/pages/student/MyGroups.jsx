import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import {
  Layers,
  BookOpen,
  Users,
  FileText,
  Lock,
  Download,
  ExternalLink,
  Bell,
  CheckCircle2,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';

export const MyGroups = () => {
  const { error } = useToast();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Group Details View Modal
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchMyGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const handleOpenGroupDetails = async (group) => {
    try {
      const res = await api.get(`/groups/${group._id}`);
      if (res.data.success) {
        setSelectedGroup(res.data.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      error('Failed to load group study materials');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
            <Layers className="w-6 h-6" />
          </div>
          My Enrolled Cohorts & Groups
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Access your academic cohorts, course announcements, and official study materials.
        </p>
      </div>

      {/* Permissions Disclaimer */}
      <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700 flex items-start gap-3">
        <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-red-300">Student Access Policy: </span>
          Group notes, lecture materials, and announcements are managed by your instructor. Students can view and download all shared materials with read-only access. Group chat is in broadcast-only mode.
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Not enrolled in any groups"
          description="Your instructor will assign you to your relevant class cohorts shortly."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((g) => (
            <div
              key={g._id}
              className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass hover:border-red-500/40 hover:shadow-red-glow transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="h-1.5 w-full" style={{ backgroundColor: g.color || '#DC2626' }} />

              <div className="p-6">
                <h3 className="text-lg font-black text-white mb-2">
                  {g.groupName}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                  {g.description || 'General course discussion and study materials cohort.'}
                </p>

                <div className="grid grid-cols-2 gap-3 p-3 bg-dark-800/90 rounded-2xl border border-dark-750 text-center">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Classmates</p>
                    <p className="text-sm font-black text-white mt-0.5">
                      {g.members?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Study Notes</p>
                    <p className="text-sm font-black text-white mt-0.5">
                      {g.notesCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-dark-900/40 border-t border-dark-750 flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {g.members?.slice(0, 4).map((m) => (
                    <img
                      key={m._id}
                      src={
                        m.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=dc2626&color=fff`
                      }
                      alt={m.name}
                      title={m.name}
                      className="inline-block h-7 w-7 rounded-full ring-2 ring-dark-850 object-cover"
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/student/chat', { state: { groupId: g._id } })}
                    className="p-2 bg-dark-800 hover:bg-dark-750 text-red-400 hover:text-white rounded-xl border border-dark-700 shadow-sm transition-all"
                    title="Open Group Chat"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenGroupDetails(g)}
                    className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 font-bold text-xs rounded-xl border border-red-800/60 shadow-red-glow-sm transition-all"
                  >
                    View Notes →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* GROUP DETAILS & NOTES MODAL */}
      {selectedGroup && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Cohort Hub: ${selectedGroup.groupName}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700">
              <h4 className="text-sm font-bold text-white">About this Group</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {selectedGroup.description || 'No description provided.'}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5 text-red-400" />
                <span>{selectedGroup.members?.length || 0} Enrolled Students</span>
              </div>
            </div>

            {/* Notes List */}
            <div>
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                <span>Study Materials & Handouts ({selectedGroup.notes?.length || 0})</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-normal">
                  <Lock className="w-3 h-3" /> Read-Only Access
                </span>
              </h4>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {selectedGroup.notes?.length > 0 ? (
                  selectedGroup.notes.map((note) => (
                    <div
                      key={note._id}
                      className={`p-4 rounded-2xl border ${
                        note.isAnnouncement
                          ? 'bg-amber-950/20 border-amber-900/60'
                          : 'bg-dark-800/90 border-dark-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {note.isAnnouncement ? (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-1 uppercase">
                              <Bell className="w-3 h-3" /> Announcement
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 flex items-center gap-1 uppercase shadow-red-glow-sm">
                              <FileText className="w-3 h-3" /> Lecture Note
                            </span>
                          )}
                          <span className="text-xs font-bold text-white">
                            {note.title}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-500 shrink-0">
                          {format(new Date(note.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-3 whitespace-pre-wrap leading-relaxed">
                        {note.description}
                      </p>

                      {note.fileUrl && (
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:underline"
                        >
                          {note.fileType === 'link' ? (
                            <>
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open Link Reference
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              Download {note.fileName || 'Resource'}
                            </>
                          )}
                        </a>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="p-6 text-center text-xs text-slate-500 bg-dark-800/90 rounded-2xl border border-dark-700">
                    No notes or announcements posted in this group yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyGroups;
