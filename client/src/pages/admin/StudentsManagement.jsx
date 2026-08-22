import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonTable } from '../../components/common/SkeletonLoader';
import {
  Users,
  Search,
  Filter,
  Trash2,
  Eye,
  Mail,
  Phone,
  Layers,
  GraduationCap,
  Award,
  FileCheck,
  ShieldCheck,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

export const StudentsManagement = () => {
  const { success, error } = useToast();

  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  // Detail Modal & Delete Dialog states
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/students', {
        params: { search, groupId: selectedGroup, page, limit: 10 }
      });
      if (res.data.success) {
        setStudents(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Error fetching students');
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
      console.error('Error fetching groups:', err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, selectedGroup]);

  const handleViewStudent = async (student) => {
    try {
      const res = await api.get(`/students/${student._id}`);
      if (res.data.success) {
        setSelectedStudent(res.data.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      error('Failed to load student details');
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/students/${studentToDelete._id}`);
      if (res.data.success) {
        success(`Student ${studentToDelete.name} removed successfully.`);
        setStudentToDelete(null);
        fetchStudents(pagination.page);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to remove student');
    } finally {
      setDeleteLoading(false);
    }
  };

  const sanitizePhoneForWhatsApp = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
              <Users className="w-6 h-6" />
            </div>
            Students Directory & Contact Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered students roster, verified contact mobile numbers, cohort enrollments, and academic performance.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-dark-850/90 backdrop-blur-xl p-4 rounded-3xl border border-dark-700/80 shadow-dark-glass">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search students by name, Gmail address, roll number, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-xs sm:text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all"
          >
            <option value="">All Cohorts / Batches</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.groupName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <SkeletonTable rows={6} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={search ? 'Try adjusting your search query.' : 'No registered students yet.'}
        />
      ) : (
        <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl border border-dark-700/80 shadow-dark-glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dark-700/80 bg-dark-800/70 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Mobile / Contact</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Enrolled Cohorts</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-750/60 text-xs">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-dark-800/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            student.profilePicture ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=dc2626&color=fff`
                          }
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-red-500/20 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {student.phoneNumber ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${student.phoneNumber}`}
                            title="Call student"
                            className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:underline"
                          >
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            {student.phoneNumber}
                          </a>
                          {sanitizePhoneForWhatsApp(student.phoneNumber) && (
                            <a
                              href={`https://wa.me/${sanitizePhoneForWhatsApp(student.phoneNumber)}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Message on WhatsApp"
                              className="p-1 rounded-md bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60 border border-emerald-900/50"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-amber-400/80 italic font-mono flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60"></span>
                          Not provided
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs font-semibold text-red-300">
                      {student.rollNumber || 'STU-NEW'}
                    </td>

                    <td className="px-6 py-4 text-slate-300 text-xs font-medium">
                      {student.department || 'Computer Science'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {student.enrolledGroups?.length > 0 ? (
                          student.enrolledGroups.map((g) => (
                            <span
                              key={g._id}
                              style={{ borderLeftColor: g.color || '#DC2626' }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-dark-800 text-slate-300 border border-dark-700 border-l-2"
                            >
                              {g.groupName}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">No groups</span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewStudent(student)}
                          title="View Profile Details"
                          className="p-2 text-slate-300 hover:text-white hover:bg-dark-800 hover:border hover:border-dark-700 rounded-xl transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStudentToDelete(student)}
                          title="Remove Student"
                          className="p-2 text-red-400 hover:text-white hover:bg-red-950/60 hover:border hover:border-red-800/60 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            onPageChange={(p) => fetchStudents(p)}
          />
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedStudent(null);
          }}
          title="Student Academic & Contact Profile"
          size="md"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-dark-800/90 border border-dark-700">
              <img
                src={
                  selectedStudent.profilePicture ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=dc2626&color=fff`
                }
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-red-500/30"
              />
              <div className="min-w-0">
                <h4 className="text-lg font-bold text-white">
                  {selectedStudent.name}
                </h4>
                <p className="text-xs text-slate-400 font-mono">{selectedStudent.email}</p>
                <p className="text-xs text-red-300 mt-1 font-semibold">
                  Roll: <span className="text-white">{selectedStudent.rollNumber}</span> | {selectedStudent.department}
                </p>
              </div>
            </div>

            {/* Direct Contact Card for Admin */}
            <div className="p-4 rounded-2xl bg-dark-800/90 border border-dark-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  Student Mobile Number
                </p>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {selectedStudent.phoneNumber || (
                    <span className="text-amber-400 font-normal italic text-xs">No mobile number registered yet</span>
                  )}
                </p>
              </div>

              {selectedStudent.phoneNumber && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedStudent.phoneNumber}`}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-red-glow flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                  {sanitizePhoneForWhatsApp(selectedStudent.phoneNumber) && (
                    <a
                      href={`https://wa.me/${sanitizePhoneForWhatsApp(selectedStudent.phoneNumber)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick stats cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-red-950/40 rounded-xl border border-red-900/50 shadow-inner-red">
                <p className="text-[10px] font-extrabold text-red-400 uppercase">Submissions</p>
                <p className="text-xl font-black text-white mt-0.5">
                  {selectedStudent.stats?.submissionCount || 0}
                </p>
              </div>
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-900/50">
                <p className="text-[10px] font-extrabold text-emerald-400 uppercase">Average Marks</p>
                <p className="text-xl font-black text-white mt-0.5">
                  {selectedStudent.stats?.overallPercentage || 0}%
                </p>
              </div>
              <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-900/50">
                <p className="text-[10px] font-extrabold text-amber-400 uppercase">Open Queries</p>
                <p className="text-xl font-black text-white mt-0.5">
                  {selectedStudent.stats?.openQueriesCount || 0}
                </p>
              </div>
            </div>

            {/* Enrolled Groups */}
            <div>
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                Enrolled Cohorts ({selectedStudent.enrolledGroups?.length || 0})
              </h5>
              <div className="space-y-2">
                {selectedStudent.enrolledGroups?.length > 0 ? (
                  selectedStudent.enrolledGroups.map((g) => (
                    <div
                      key={g._id}
                      className="p-3 rounded-xl bg-dark-800/90 border border-dark-700 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">
                          {g.groupName}
                        </p>
                        <p className="text-[11px] text-slate-400">{g.description || 'Cohort discussion & assignments'}</p>
                      </div>
                      <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: g.color || '#DC2626' }}></span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Not enrolled in any groups yet.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteStudent}
        title="Remove Student Record"
        message={`Are you sure you want to remove ${studentToDelete?.name}? This will remove them from all enrolled groups.`}
        confirmText="Remove Student"
        loading={deleteLoading}
      />
    </div>
  );
};

export default StudentsManagement;
