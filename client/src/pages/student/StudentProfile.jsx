import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Layers,
  Building,
  Save,
  Camera,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const StudentProfile = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [rollNumber, setRollNumber] = useState(user?.rollNumber || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('department', department.trim());
      formData.append('rollNumber', rollNumber.trim());
      formData.append('phoneNumber', phoneNumber.trim());
      if (avatarFile) {
        formData.append('profilePicture', avatarFile);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        success('Profile updated successfully!');
        updateUser(res.data.user);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <div className="p-2 bg-red-950/60 text-red-500 rounded-2xl border border-red-900/50 shadow-red-glow-sm">
            <User className="w-6 h-6" />
          </div>
          Student Account Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your student identity, contact number, enrolled cohorts, and personal preferences.
        </p>
      </div>

      {!user?.phoneNumber && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-900/50 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-300">Mobile Number Required for Instructor Contact</p>
            <p className="mt-0.5 text-amber-200/80">
              Please enter your registered mobile number below so that the instructor and department can reach you regarding important project updates and deadlines. Duplicate numbers are not permitted.
            </p>
          </div>
        </div>
      )}

      <div className="bg-dark-850/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-dark-700/80 shadow-dark-glass">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-dark-750 text-center sm:text-left">
          <div className="relative">
            <img
              src={
                user?.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Student')}&background=dc2626&color=fff`
              }
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-red-500/20 shadow-red-glow-sm"
            />
            <label className="absolute bottom-0 right-0 p-2 bg-red-600 hover:bg-red-500 text-white rounded-full cursor-pointer shadow-red-glow transition-all active:scale-95">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <h2 className="text-xl font-black text-white">
              {user?.name}
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
              <p className="text-xs text-slate-400 font-mono flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {user?.email}
              </p>
              {user?.phoneNumber && (
                <p className="text-xs text-slate-400 font-mono flex items-center justify-center sm:justify-start gap-1">
                  <Phone className="w-3.5 h-3.5 text-red-500" />
                  {user.phoneNumber}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-900/50 shadow-red-glow-sm">
                Roll: {user?.rollNumber || 'STU-NEW'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-dark-800 text-slate-300 border border-dark-700">
                {user?.department || 'Computer Science & Engineering'}
              </span>
              {user?.phoneNumber ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-900/50 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  Contact Verified
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-900/50 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  No Mobile Number
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Student Gmail (Verified via Google OAuth)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 bg-dark-900 border border-dark-750 rounded-xl text-sm text-slate-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Roll / Student Number
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. CS2026-001"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5">
                Department / Program
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-red-500" />
                Mobile / Contact Number *
              </span>
              <span className="text-[10px] font-medium text-slate-400 normal-case">
                (Visible to instructor for contact; duplicates disallowed)
              </span>
            </label>
            <input
              type="tel"
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-4 py-2.5 bg-dark-800/90 border border-dark-700 rounded-xl text-sm text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none placeholder:text-slate-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Your registered mobile number is used exclusively for department contact and academic notifications.
            </p>
          </div>

          {/* Enrolled Groups overview */}
          <div className="pt-3">
            <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2">
              My Enrolled Cohorts & Classes
            </label>
            <div className="flex flex-wrap gap-2">
              {user?.enrolledGroups?.length > 0 ? (
                user.enrolledGroups.map((g) => (
                  <span
                    key={g._id || g}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-dark-800 text-slate-200 border border-dark-700 flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-red-500" />
                    {g.groupName || 'Active Cohort'}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic">No groups enrolled yet</span>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-red-glow hover:shadow-red-glow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
