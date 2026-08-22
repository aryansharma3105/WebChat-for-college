import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import {
  BookOpen,
  Search,
  Filter,
  FileText,
  Bell,
  Download,
  ExternalLink,
  Layers,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';

export const MyNotes = () => {
  const { error } = useToast();

  const [notes, setNotes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

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
      error(err.response?.data?.message || 'Error loading notes');
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
      fetchNotes();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, selectedGroup]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          Notes & Study Material Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Official course notes, lecture PDFs, reference links, and cohort announcements shared by your professor.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-dark-850/90 backdrop-blur-xl p-4 rounded-3xl border border-dark-700/80 shadow-dark-glass">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes by title or keywords..."
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
            <option value="">All My Groups</option>
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
          title="No study materials found"
          description="Your instructor has not shared any notes or announcements matching your filter."
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
                <div className="flex items-center justify-between gap-2 mb-3">
                  {note.isAnnouncement ? (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/60 flex items-center gap-1 uppercase tracking-wider">
                      <Bell className="w-3 h-3" /> Announcement
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800/60 flex items-center gap-1 uppercase tracking-wider shadow-red-glow-sm">
                      <FileText className="w-3 h-3" /> Lecture Note
                    </span>
                  )}

                  <span className="text-[10px] text-slate-500">
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </span>
                </div>

                <h3 className="text-base font-black text-white mb-2 leading-snug">
                  {note.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 mb-4 whitespace-pre-wrap leading-relaxed">
                  {note.description || 'No description provided.'}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Layers className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="font-bold text-slate-300">
                    {note.groupId?.groupName || 'Cohort'}
                  </span>
                </div>
              </div>

              {/* Action link */}
              <div className="mt-5 pt-3 border-t border-dark-750 flex items-center">
                {note.fileUrl ? (
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 hover:underline max-w-full truncate"
                  >
                    {note.fileType === 'link' ? (
                      <>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        Open External Reference
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 shrink-0" />
                        {note.fileName || 'Download Resource File'}
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
    </div>
  );
};

export default MyNotes;
