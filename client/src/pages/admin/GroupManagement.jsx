import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import {
  Layers,
  Plus,
  Users,
  BookOpen,
  FileText,
  UserPlus,
  Trash2,
  Edit2,
  X,
  Search,
  Check,
  FolderOpen,
  MessageSquare
} from 'lucide-react';

export const GroupManagement = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  // Active group selection
  const [activeGroup, setActiveGroup] = useState(null);

  // Form states
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#DC2626');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const colors = [
    '#DC2626', // Crimson Red
    '#EF4444', // Bright Red
    '#B91C1C', // Deep Ruby
    '#9333EA', // Purple
    '#059669', // Emerald
    '#2563EB', // Blue
    '#D97706', // Amber
    '#0891B2'  // Cyan
  ];

  const fetchGroups = async () => {
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

  const fetchAllStudents = async () => {
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
    fetchGroups();
    fetchAllStudents();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.post('/groups', {
        groupName: groupName.trim(),
        description: description.trim(),
        color,
        memberIds: selectedStudentIds
      });

      if (res.data.success) {
        success('Group created successfully!');
        setIsCreateOpen(false);
        resetForm();
        fetchGroups();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    if (!activeGroup || !groupName.trim()) return;

    setActionLoading(true);
    try {
      const res = await api.put(`/groups/${activeGroup._id}`, {
        groupName: groupName.trim(),
        description: description.trim(),
        color
      });

      if (res.data.success) {
        success('Group updated successfully!');
        setIsEditOpen(false);
        resetForm();
        fetchGroups();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/groups/${groupToDelete._id}`);
      if (res.data.success) {
        success('Group deleted successfully.');
        setGroupToDelete(null);
        fetchGroups();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenRoster = async (group) => {
    try {
      const res = await api.get(`/groups/${group._id}`);
      if (res.data.success) {
        setActiveGroup(res.data.data);
        setIsRosterOpen(true);
      }
    } catch (err) {
      error('Failed to load group roster');
    }
  };

  const handleRemoveStudentFromGroup = async (studentId) => {
    try {
      const res = await api.delete(`/groups/${activeGroup._id}/members/${studentId}`);
      if (res.data.success) {
        success('Student removed from group.');
        setActiveGroup(res.data.data);
        fetchGroups();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleAddMembersToGroup = async () => {
    if (selectedStudentIds.length === 0) {
      error('Please select at least one student to add.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.post(`/groups/${activeGroup._id}/members`, {
        studentIds: selectedStudentIds
      });

      if (res.data.success) {
        success('Students added to group successfully!');
        setActiveGroup(res.data.data);
        setIsAddMembersOpen(false);
        setSelectedStudentIds([]);
        fetchGroups();
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add students');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setDescription('');
    setColor('#DC2626');
    setSelectedStudentIds([]);
    setActiveGroup(null);
  };

  const openEditModal = (group) => {
    setActiveGroup(group);
    setGroupName(group.groupName);
    setDescription(group.description || '');
    setColor(group.color || '#DC2626');
    setIsEditOpen(true);
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filter students for member addition
  const availableStudentsToAdd = students.filter(
    (s) => !activeGroup?.members?.some((m) => m._id.toString() === s._id.toString())
  ).filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
              <Layers className="w-6 h-6" />
            </div>
            Cohorts & Group Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create class sections, organize student cohorts, broadcast material, and manage member rosters.
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
          Create New Cohort
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No student groups created"
          description="Create student groups to organize cohorts, assign group tasks, and share notes."
          actionText="Create First Group"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 hover:border-red-500/40 shadow-dark-glass hover:shadow-red-glow transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Colored top stripe */}
              <div className="h-1.5 w-full shadow-sm" style={{ backgroundColor: group.color || '#DC2626' }} />

              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-red-100 transition-colors">
                    {group.groupName}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(group)}
                      title="Edit Group"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGroupToDelete(group)}
                      title="Delete Group"
                      className="p-1.5 text-red-400 hover:text-white hover:bg-red-950/60 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-6 font-normal leading-relaxed">
                  {group.description || 'Cohort discussion, announcements, and study material repository.'}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 px-4 bg-dark-800/80 rounded-2xl text-center border border-dark-700">
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Students</p>
                    <p className="text-sm font-black text-white mt-0.5">
                      {group.members?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Notes</p>
                    <p className="text-sm font-black text-white mt-0.5">
                      {group.notesCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Tasks</p>
                    <p className="text-sm font-black text-white mt-0.5">
                      {group.assignmentsCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-dark-900/60 border-t border-dark-750 flex items-center justify-between">
                <div className="flex -space-x-2 overflow-hidden">
                  {group.members?.slice(0, 4).map((member) => (
                    <img
                      key={member._id}
                      src={
                        member.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=dc2626&color=fff`
                      }
                      alt={member.name}
                      title={member.name}
                      className="inline-block h-7 w-7 rounded-full ring-2 ring-dark-900 object-cover"
                    />
                  ))}
                  {group.members?.length > 4 && (
                    <span className="flex items-center justify-center h-7 w-7 rounded-full bg-dark-800 text-[10px] font-bold text-slate-300 ring-2 ring-dark-900 border border-dark-700">
                      +{group.members.length - 4}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/admin/chat', { state: { groupId: group._id } })}
                    className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-800/60 text-red-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold shadow-red-glow-sm"
                    title="Open Cohort Group Chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-red-400" />
                    Chat
                  </button>

                  <button
                    onClick={() => handleOpenRoster(group)}
                    className="text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded-xl transition-all"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Roster
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Student Cohort"
        size="md"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g. Computer Science - Section B"
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview or batch specifications..."
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
              Cohort Accent Color
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-dark-900 ring-red-500' : 'hover:scale-110'
                  }`}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Select Initial Students */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
              Select Initial Members ({selectedStudentIds.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto divide-y divide-dark-750 border border-dark-700 rounded-xl">
              {students.map((s) => (
                <div
                  key={s._id}
                  onClick={() => toggleStudentSelection(s._id)}
                  className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedStudentIds.includes(s._id)
                      ? 'bg-red-950/40 text-red-200'
                      : 'hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        s.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=dc2626&color=fff`
                      }
                      alt={s.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-400">{s.email}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(s._id)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-dark-800 border-dark-700"
                  />
                </div>
              ))}
            </div>
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
              {actionLoading ? 'Creating...' : 'Create Cohort'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT GROUP MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Cohort Information"
        size="md"
      >
        <form onSubmit={handleUpdateGroup} className="space-y-4">
          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Group Name *
            </label>
            <input
              type="text"
              required
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
              Cohort Accent Color
            </label>
            <div className="flex items-center gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-dark-900 ring-red-500' : 'hover:scale-110'
                  }`}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
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
              {actionLoading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ROSTER MANAGEMENT MODAL */}
      {activeGroup && (
        <Modal
          isOpen={isRosterOpen}
          onClose={() => setIsRosterOpen(false)}
          title={`Roster: ${activeGroup.groupName}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  Enrolled Students ({activeGroup.members?.length || 0})
                </p>
                <p className="text-xs text-slate-400">
                  Manage student membership for this cohort.
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedStudentIds([]);
                  setStudentSearch('');
                  setIsAddMembersOpen(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-red-glow-sm"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Students
              </button>
            </div>

            <div className="divide-y divide-dark-750 border border-dark-700 rounded-2xl max-h-96 overflow-y-auto bg-dark-800/40">
              {activeGroup.members?.length > 0 ? (
                activeGroup.members.map((member) => (
                  <div
                    key={member._id}
                    className="p-3 flex items-center justify-between hover:bg-dark-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          member.profilePicture ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=dc2626&color=fff`
                        }
                        alt={member.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-dark-700"
                      />
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          {member.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {member.email} | {member.rollNumber || 'STU'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveStudentFromGroup(member._id)}
                      title="Remove from group"
                      className="p-2 text-red-400 hover:text-white hover:bg-red-950/60 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No students enrolled in this group yet.
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ADD STUDENTS TO GROUP MODAL */}
      <Modal
        isOpen={isAddMembersOpen}
        onClose={() => setIsAddMembersOpen(false)}
        title="Add Students to Cohort"
        size="md"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search students by name or email..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800/90 border border-dark-700 rounded-xl text-xs text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-dark-750 border border-dark-700 rounded-2xl bg-dark-800/40">
            {availableStudentsToAdd.length > 0 ? (
              availableStudentsToAdd.map((s) => (
                <div
                  key={s._id}
                  onClick={() => toggleStudentSelection(s._id)}
                  className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    selectedStudentIds.includes(s._id)
                      ? 'bg-red-950/40 text-red-200'
                      : 'hover:bg-dark-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={
                        s.profilePicture ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=dc2626&color=fff`
                      }
                      alt={s.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{s.email}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(s._id)}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-dark-800 border-dark-700"
                  />
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                All eligible students are already members of this cohort.
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsAddMembersOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-300 bg-dark-800 hover:bg-dark-750 rounded-xl border border-dark-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMembersToGroup}
              disabled={actionLoading || selectedStudentIds.length === 0}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-red-glow disabled:opacity-50"
            >
              {actionLoading ? 'Adding...' : `Add Selected (${selectedStudentIds.length})`}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Group Confirmation */}
      <ConfirmDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleDeleteGroup}
        title="Delete Student Cohort"
        message={`Are you sure you want to delete "${groupToDelete?.groupName}"? Associated notes and assignments will also be affected.`}
        confirmText="Delete Cohort"
        loading={actionLoading}
      />
    </div>
  );
};

export default GroupManagement;
