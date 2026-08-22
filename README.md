# Web-Based Student Group & Academic Management System (EduPortal)

A modern, responsive full-stack web application built for universities, educators, and students to manage student groups, assignments, submissions, marks, lecture notes, academic support queries, and real-time 1-on-1 chat.

---

## 🌟 Key Highlights & Features

### 1. User Roles & Security
- **Admin / Teacher**:
  - Full control over student rosters, group cohorts, assignments, grading, study materials, student queries, and chat.
  - **Default Credentials**: ID `admin-profpankaj25` | Password: `pass1225` (Passwords hashed securely with bcrypt).
  - Admin's personal email and personal account details are completely hidden from students.
- **Students**:
  - Sign-in with **Google OAuth** or single-click **Demo Student Mode**.
  - Strict role-based access control: Students can only view their own marks, their own submissions, their own queries, and study materials shared in their enrolled groups.

### 2. Admin Dashboard & Operations
- **Overview KPIs**: Global student count, active cohorts, submission compliance rates, average class percentage, unread chat notifications.
- **Students Management**: Search by name, roll number, or Gmail; filter by cohort; view student academic profiles; delete student with cascading relation cleanup.
- **Group Cohort Management**: Create multiple groups with custom accent colors; add/remove student members; manage cohort-specific notes; open cohort live chat.
- **Assignment Management**: Create assignments with deadlines, markdown instructions, and PDF attachments; target specific groups or the entire class.
- **Submission Status Matrix**: Dedicated section tracking student submission status (**Submitted**, **Late Submission**, **Not Submitted / Pending**), download submitted files, open external repository links, and award marks.
- **Marks & Grading**: Add/edit/delete marks per assessment; provide teacher remarks/feedback; calculate percentage.
- **Notes & Announcements**: Share lecture PDFs, external documentation links, and priority class announcements.
- **Student Queries**: Academic support ticket system with statuses (**Open**, **In Progress**, **Resolved**) and threaded replies.
- **Real-Time Group & Direct Chat**:
  - **Cohort Group Chat**: Real-time group discussions per class/cohort.
  - **Attachment Permissions**: **Only Admin/Instructor can send file attachments in Group Chat** (PDFs, slides, code, images).
  - **Student View**: Students can freely participate in text chat and **view/download all attachments shared by the Admin**.
  - **1-on-1 Direct Chat**: Private academic channel between students and instructor with unread notification badges.

### 3. Student Dashboard & Portal
- **Student Overview**: Enrolled cohorts, upcoming assignment deadlines, recent marks, query status, and unread teacher messages.
- **My Groups**: View enrolled cohorts, read announcements, download lecture PDFs, and launch cohort group chats.
- **My Assignments & Submissions**: View assigned coursework, submit files or repository links, review timestamps, and view grading feedback.
- **My Marks**: Private marks report across subjects and assessments with percentage calculation.
- **Support Queries**: Submit questions to instructor, track ticket status, and read replies.
- **Interactive Chat Hub**: Toggle seamlessly between enrolled **Cohort Group Chats** and **1-on-1 Direct Teacher Chat**. Students can review instructor attachments and participate in live group discussions.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v7, Axios, Socket.IO Client, `@react-oauth/google`
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, Socket.IO, Multer (File Storage), JWT, bcryptjs, `google-auth-library`
- **Zero-Config Database Fallback**: Includes automatic in-memory MongoDB fallback when local `mongod` is not running, ensuring immediate out-of-the-box operation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### 1. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Run Database Seeder
Seed default admin (`admin-profpankaj25` / `pass1225`) and realistic student sample data:
```bash
npm run seed
```

### 3. Start Development Servers
Start both backend API (Port 5000) and frontend client (Port 5173) concurrently:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

---

## 🔑 Default Login Credentials

### Admin / Teacher
- **Admin ID**: `admin-profpankaj25`
- **Password**: `pass1225`

### Demo Students (Instant One-Click Login)
- **Rahul Sharma**: `rahul.sharma@gmail.com`
- **Priya Singh**: `priya.singh@gmail.com`
- **Aman Kumar**: `aman.kumar@gmail.com` (Pending assignment & open query)
- **Sneha Patel**: `sneha.patel@gmail.com`

---

## 🔒 Google OAuth Setup (Optional for Production)

To enable live Google Sign-In with Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Application type: Web application).
3. Add Authorized JavaScript origins: `http://localhost:5173`.
4. Copy the **Client ID** and set in `.env`:
   - In `server/.env`: `GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`
   - In `client/.env`: `VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com`

---

## 📁 Project Structure

```
d:/webchat/
├── client/                     # Vite + React Frontend
│   ├── src/
│   │   ├── api/                # Axios instance with JWT interceptors
│   │   ├── components/         # Reusable UI components & layouts
│   │   │   ├── common/         # Navbar, Sidebar, StatCard, Badge, Modal, etc.
│   │   │   └── layout/         # AdminLayout, StudentLayout
│   │   ├── context/            # Auth, Socket, Theme, Toast contexts
│   │   ├── pages/
│   │   │   ├── auth/           # Split Admin & Student Login
│   │   │   ├── admin/          # Admin dashboard & management views
│   │   │   └── student/        # Student dashboard & coursework views
│   │   ├── App.jsx             # React Router routing
│   │   └── main.jsx            # React root with providers
├── server/                     # Express + Socket.IO Backend
│   ├── src/
│   │   ├── config/             # DB connector & env loader
│   │   ├── controllers/        # Business logic for all modules
│   │   ├── middleware/         # Auth, Role guards, Multer uploads, Error handling
│   │   ├── models/             # Mongoose schemas (User, Group, Assignment, etc.)
│   │   ├── routes/             # REST API routes
│   │   ├── sockets/            # Real-time chat socket handlers
│   │   ├── seed.js             # Seed script with realistic demo data
│   │   └── server.js           # Server entrypoint
├── .env.example
├── package.json
└── README.md
```
