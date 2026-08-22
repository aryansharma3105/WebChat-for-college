import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';

// Auth Page
import LoginPage from './pages/auth/LoginPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsManagement from './pages/admin/StudentsManagement';
import GroupManagement from './pages/admin/GroupManagement';
import AssignmentManagement from './pages/admin/AssignmentManagement';
import SubmissionStatus from './pages/admin/SubmissionStatus';
import MarksManagement from './pages/admin/MarksManagement';
import NotesManagement from './pages/admin/NotesManagement';
import StudentQueries from './pages/admin/StudentQueries';
import AdminChat from './pages/admin/AdminChat';
import AdminSettings from './pages/admin/AdminSettings';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyGroups from './pages/student/MyGroups';
import MyAssignments from './pages/student/MyAssignments';
import MySubmissions from './pages/student/MySubmissions';
import MyMarks from './pages/student/MyMarks';
import MyNotes from './pages/student/MyNotes';
import MyQueries from './pages/student/MyQueries';
import StudentChat from './pages/student/StudentChat';
import StudentProfile from './pages/student/StudentProfile';

function RootRedirect() {
  const { user, loading, isAdmin, isStudent } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (isStudent) return <Navigate to="/student" replace />;
  return <Navigate to="/login" replace />;
}

export const App = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Dashboard Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="groups" element={<GroupManagement />} />
        <Route path="assignments" element={<AssignmentManagement />} />
        <Route path="submissions" element={<SubmissionStatus />} />
        <Route path="marks" element={<MarksManagement />} />
        <Route path="notes" element={<NotesManagement />} />
        <Route path="queries" element={<StudentQueries />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Student Dashboard Routes */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<StudentDashboard />} />
        <Route path="groups" element={<MyGroups />} />
        <Route path="assignments" element={<MyAssignments />} />
        <Route path="submissions" element={<MySubmissions />} />
        <Route path="marks" element={<MyMarks />} />
        <Route path="notes" element={<MyNotes />} />
        <Route path="queries" element={<MyQueries />} />
        <Route path="chat" element={<StudentChat />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
