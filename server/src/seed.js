import mongoose from 'mongoose';
import { connectDB, closeDB } from './config/db.js';
import { ENV } from './config/env.js';
import { User } from './models/User.js';
import { Group } from './models/Group.js';
import { Assignment } from './models/Assignment.js';
import { Submission } from './models/Submission.js';
import { Mark } from './models/Mark.js';
import { Note } from './models/Note.js';
import { Query } from './models/Query.js';
import { Message } from './models/Message.js';
import { GroupMessage } from './models/GroupMessage.js';

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Group.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Mark.deleteMany({}),
      Note.deleteMany({}),
      Query.deleteMany({}),
      Message.deleteMany({}),
      GroupMessage.deleteMany({})
    ]);

    // 1. Create Default Admin
    // Note: User model pre-save hook will hash password automatically
    const admin = await User.create({
      customId: ENV.ADMIN_DEFAULT_ID || 'admin-profpankaj25',
      name: ENV.ADMIN_NAME || 'Prof. Pankaj Sharma',
      email: ENV.ADMIN_EMAIL || 'prof.pankaj@university.edu',
      role: 'admin',
      password: ENV.ADMIN_DEFAULT_PASSWORD || 'pass1225',
      department: 'Department of Computer Science',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    console.log(`👤 Admin created: ${admin.name} (ID: ${admin.customId})`);

    // 2. Create Students
    const studentsData = [
      {
        name: 'Rahul Sharma',
        email: 'rahul.sharma@gmail.com',
        rollNumber: 'CS2026-001',
        phoneNumber: '+91 98765 43210',
        department: 'Computer Science & Engineering',
        profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Priya Singh',
        email: 'priya.singh@gmail.com',
        rollNumber: 'CS2026-002',
        phoneNumber: '+91 98765 43211',
        department: 'Computer Science & Engineering',
        profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Aman Kumar',
        email: 'aman.kumar@gmail.com',
        rollNumber: 'CS2026-003',
        phoneNumber: '+91 98765 43212',
        department: 'Information Technology',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@gmail.com',
        rollNumber: 'CS2026-004',
        phoneNumber: '+91 98765 43213',
        department: 'Computer Science & Engineering',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Rohan Gupta',
        email: 'rohan.gupta@gmail.com',
        rollNumber: 'CS2026-005',
        phoneNumber: '+91 98765 43214',
        department: 'Data Science',
        profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        name: 'Ananya Verma',
        email: 'ananya.verma@gmail.com',
        rollNumber: 'CS2026-006',
        phoneNumber: '+91 98765 43215',
        department: 'Information Technology',
        profilePicture: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      }
    ];

    const createdStudents = await User.insertMany(
      studentsData.map((s) => ({ ...s, role: 'student', isActive: true }))
    );

    console.log(`🎓 Created ${createdStudents.length} demo students.`);

    // 3. Create Groups
    const group1 = await Group.create({
      groupName: 'Computer Science - Section A',
      description: 'Core batch for 3rd Year B.Tech Computer Science students.',
      color: '#4F46E5', // Indigo
      createdBy: admin._id,
      members: [createdStudents[0]._id, createdStudents[1]._id, createdStudents[3]._id]
    });

    const group2 = await Group.create({
      groupName: 'Data Structures & Algorithms Lab',
      description: 'Weekly practical lab sessions and algorithmic problem sets.',
      color: '#059669', // Emerald
      createdBy: admin._id,
      members: [createdStudents[0]._id, createdStudents[1]._id, createdStudents[2]._id, createdStudents[3]._id]
    });

    const group3 = await Group.create({
      groupName: 'Web Development & Cloud Computing',
      description: 'Full-stack MERN, REST APIs, Microservices, and Cloud deployment.',
      color: '#D97706', // Amber
      createdBy: admin._id,
      members: [createdStudents[0]._id, createdStudents[2]._id, createdStudents[4]._id, createdStudents[5]._id]
    });

    const group4 = await Group.create({
      groupName: 'Database Management Systems (DBMS)',
      description: 'Relational DBs, Normalization, SQL, and NoSQL systems.',
      color: '#9333EA', // Purple
      createdBy: admin._id,
      members: [createdStudents[1]._id, createdStudents[3]._id, createdStudents[4]._id, createdStudents[5]._id]
    });

    // Update students' enrolledGroups
    await Promise.all([
      User.findByIdAndUpdate(createdStudents[0]._id, { enrolledGroups: [group1._id, group2._id, group3._id] }),
      User.findByIdAndUpdate(createdStudents[1]._id, { enrolledGroups: [group1._id, group2._id, group4._id] }),
      User.findByIdAndUpdate(createdStudents[2]._id, { enrolledGroups: [group2._id, group3._id] }),
      User.findByIdAndUpdate(createdStudents[3]._id, { enrolledGroups: [group1._id, group2._id, group4._id] }),
      User.findByIdAndUpdate(createdStudents[4]._id, { enrolledGroups: [group3._id, group4._id] }),
      User.findByIdAndUpdate(createdStudents[5]._id, { enrolledGroups: [group3._id, group4._id] })
    ]);

    console.log('👥 Created 4 student groups and enrolled members.');

    // 4. Create Notes & Announcements
    await Note.create([
      {
        title: 'Important: Mid-Term Examination Schedule & Syllabus',
        description: 'Mid-term exams will commence from next Monday. Please review the attached syllabus and guidelines.',
        groupId: group1._id,
        isAnnouncement: true,
        fileType: 'announcement',
        uploadedBy: admin._id
      },
      {
        title: 'Lecture 04: AVL Trees & Self Balancing Binary Trees',
        description: 'Comprehensive notes covering left-right rotations, tree balance factor, and complexity analysis.',
        groupId: group2._id,
        fileType: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'DSA_Lecture_04_AVL_Trees.pdf',
        uploadedBy: admin._id
      },
      {
        title: 'DBMS Schema Normalization (1NF, 2NF, 3NF, BCNF) Reference Sheet',
        description: 'Summary guide with worked examples of decomposition and dependency preservation.',
        groupId: group4._id,
        fileType: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'DBMS_Normalization_CheatSheet.pdf',
        uploadedBy: admin._id
      },
      {
        title: 'Full-Stack REST API & JWT Authentication Architecture Guide',
        description: 'Code snippets and diagrams illustrating secure token authorization and refresh flows.',
        groupId: group3._id,
        fileType: 'link',
        externalLink: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
        fileName: 'REST_Architecture_Docs',
        uploadedBy: admin._id
      }
    ]);

    console.log('📚 Created notes and announcements.');

    // 5. Create Assignments
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    const futureDate2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // 10 days from now
    const pastDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago

    const assignment1 = await Assignment.create({
      title: 'DSA Assignment 1: Binary Search Trees & AVL Rotations',
      description: 'Implement insertion, deletion, and balancing algorithms for an AVL tree with test assertions.',
      subject: 'Data Structures & Algorithms',
      assignedGroup: group2._id,
      dueDate: futureDate1,
      totalMarks: 100,
      attachment: {
        filename: 'DSA_Assignment_1_Instructions.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'application/pdf'
      },
      createdBy: admin._id
    });

    const assignment2 = await Assignment.create({
      title: 'DBMS Lab Project: Hospital Management ER & SQL Queries',
      description: 'Design the relational schema with constraints and write 10 complex join & aggregate queries.',
      subject: 'Database Management Systems',
      assignedGroup: group4._id,
      dueDate: futureDate2,
      totalMarks: 100,
      attachment: {
        filename: 'DBMS_Project_ProblemStatement.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'application/pdf'
      },
      createdBy: admin._id
    });

    const assignment3 = await Assignment.create({
      title: 'Web Dev Lab: Modern Responsive Dashboard in React',
      description: 'Build a modular single page application with Tailwind CSS and React Router.',
      subject: 'Web Technologies',
      assignedGroup: group3._id,
      dueDate: pastDate,
      totalMarks: 100,
      attachment: {
        filename: 'Web_Dev_Lab_Instructions.pdf',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileType: 'application/pdf'
      },
      createdBy: admin._id
    });

    console.log('📝 Created assignments.');

    // 6. Create Submissions
    // Rahul Sharma - Submitted DSA Assignment 1
    await Submission.create({
      assignmentId: assignment1._id,
      studentId: createdStudents[0]._id,
      submissionLink: 'https://github.com/rahul-sharma/dsa-avl-tree',
      fileName: 'GitHub Repository',
      comments: 'All test cases passing. Included tree visualizer.',
      status: 'submitted',
      submittedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      grade: {
        marks: 85,
        feedback: 'Excellent tree traversal logic and clean code comments.',
        gradedAt: new Date(),
        gradedBy: admin._id
      }
    });

    // Priya Singh - Submitted DSA Assignment 1
    await Submission.create({
      assignmentId: assignment1._id,
      studentId: createdStudents[1]._id,
      submissionLink: 'https://github.com/priya-singh/dsa-bst-avl',
      fileName: 'GitHub Repository',
      comments: 'Implemented double rotation and balancing factor checking.',
      status: 'submitted',
      submittedAt: new Date(now.getTime() - 20 * 60 * 60 * 1000),
      grade: {
        marks: 94,
        feedback: 'Outstanding implementation and comprehensive test coverage!',
        gradedAt: new Date(),
        gradedBy: admin._id
      }
    });

    // Sneha Patel - Submitted Web Dev Lab (Late)
    await Submission.create({
      assignmentId: assignment3._id,
      studentId: createdStudents[3]._id,
      submissionLink: 'https://github.com/sneha-patel/react-dashboard',
      fileName: 'GitHub Repository',
      comments: 'Submitted with Tailwind CSS integration.',
      status: 'late',
      submittedAt: new Date(),
      grade: {
        marks: 78,
        feedback: 'Good styling and responsive layout, minor late deduction applied.',
        gradedAt: new Date(),
        gradedBy: admin._id
      }
    });

    // Note: Aman Kumar has NOT submitted Assignment 1 (Status: Pending)

    console.log('📥 Created student submissions.');

    // 7. Create Marks
    await Mark.create([
      {
        studentId: createdStudents[0]._id, // Rahul
        subject: 'Data Structures & Algorithms',
        assessmentName: 'DSA Assignment 1',
        marksObtained: 85,
        totalMarks: 100,
        remarks: 'Excellent tree traversal logic and clean code comments.',
        enteredBy: admin._id
      },
      {
        studentId: createdStudents[0]._id, // Rahul
        subject: 'Database Management Systems',
        assessmentName: 'DBMS Test 1',
        marksObtained: 72,
        totalMarks: 100,
        remarks: 'Good understanding of relational algebra; practice nested subqueries.',
        enteredBy: admin._id
      },
      {
        studentId: createdStudents[1]._id, // Priya
        subject: 'Data Structures & Algorithms',
        assessmentName: 'DSA Assignment 1',
        marksObtained: 94,
        totalMarks: 100,
        remarks: 'Outstanding implementation and comprehensive test coverage!',
        enteredBy: admin._id
      },
      {
        studentId: createdStudents[1]._id, // Priya
        subject: 'Database Management Systems',
        assessmentName: 'DBMS Test 1',
        marksObtained: 88,
        totalMarks: 100,
        remarks: 'Great performance in normalization questions.',
        enteredBy: admin._id
      },
      {
        studentId: createdStudents[3]._id, // Sneha
        subject: 'Web Technologies',
        assessmentName: 'Web Tech Lab 2',
        marksObtained: 78,
        totalMarks: 100,
        remarks: 'Good layout and state management.',
        enteredBy: admin._id
      }
    ]);

    console.log('📊 Created marks records.');

    // 8. Create Queries
    await Query.create([
      {
        studentId: createdStudents[0]._id, // Rahul Sharma
        subject: 'Trouble understanding Assignment 2 AVL rotations',
        message: 'I am having trouble understanding how double rotations work in AVL trees when balance factor is -2.',
        status: 'in_progress',
        priority: 'high',
        relatedCourse: 'Data Structures & Algorithms',
        responses: [
          {
            senderId: admin._id,
            senderRole: 'admin',
            senderName: 'Prof. Pankaj Sharma',
            message: 'Please check the notes shared in your group ("Lecture 04: AVL Trees"). If the problem continues, explain which question you are facing difficulty with.',
            createdAt: new Date(now.getTime() - 10 * 60 * 60 * 1000)
          },
          {
            senderId: createdStudents[0]._id,
            senderRole: 'student',
            senderName: 'Rahul Sharma',
            message: 'Thank you Professor! The diagrams in Lecture 04 helped clarify the Right-Left rotation step.',
            createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
          }
        ]
      },
      {
        studentId: createdStudents[1]._id, // Priya Singh
        subject: 'Clarification on DBMS Normalization Project submission format',
        message: 'Are we required to submit the SQL schema script as a .sql file or write it inside the PDF report?',
        status: 'resolved',
        priority: 'medium',
        relatedCourse: 'Database Management Systems',
        responses: [
          {
            senderId: admin._id,
            senderRole: 'admin',
            senderName: 'Prof. Pankaj Sharma',
            message: 'You should upload both the PDF design document and the runnable .sql script in a zip archive or GitHub link.',
            createdAt: new Date(now.getTime() - 15 * 60 * 60 * 1000)
          }
        ]
      },
      {
        studentId: createdStudents[2]._id, // Aman Kumar
        subject: 'Extension request for Web Tech assignment',
        message: 'Dear Professor, I was unwell for the past two days and would like to request a 2-day extension for the Web Dev submission.',
        status: 'open',
        priority: 'urgent',
        relatedCourse: 'Web Technologies',
        responses: []
      }
    ]);

    console.log('💬 Created student queries and replies.');

    // 9. Create Chat Messages
    await Message.create([
      {
        studentId: createdStudents[0]._id, // Rahul
        senderId: createdStudents[0]._id,
        senderRole: 'student',
        content: 'Hello Professor, regarding the office hours tomorrow, will it be online or in the department?',
        createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        isRead: true
      },
      {
        studentId: createdStudents[0]._id,
        senderId: admin._id,
        senderRole: 'admin',
        content: 'Hello Rahul, office hours will be held in Cabin 304 from 2:00 PM to 4:00 PM.',
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        isRead: true
      },
      {
        studentId: createdStudents[2]._id, // Aman
        senderId: createdStudents[2]._id,
        senderRole: 'student',
        content: 'Good evening Sir, I submitted my medical certificate through the query ticket.',
        createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        isRead: false
      }
    ]);

    console.log('⚡ Created sample chat messages.');

    // 10. Create Group Chat Messages (Instructor Broadcasts & Announcements)
    await GroupMessage.create([
      {
        groupId: group2._id, // DSA Lab
        senderId: admin._id,
        senderRole: 'admin',
        content: 'Welcome everyone to the Data Structures & Algorithms Lab cohort! I have attached the AVL Tree assignment problem set and test assertions below. Please review before our Thursday lab session.',
        attachment: {
          url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          name: 'DSA_Lab_Guidelines_AVL_Trees.pdf',
          fileType: 'application/pdf'
        },
        createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000)
      },
      {
        groupId: group2._id,
        senderId: admin._id,
        senderRole: 'admin',
        content: 'Reminder for Assignment 1: You may choose either C++ or Java. Make sure your time complexity is strictly O(log n) for all re-balancing operations.',
        createdAt: new Date(now.getTime() - 16 * 60 * 60 * 1000)
      },
      {
        groupId: group3._id, // Web Dev
        senderId: admin._id,
        senderRole: 'admin',
        content: 'Greetings Web Tech cohort! Here is the reference diagram for the JWT Authentication Flow architecture we discussed during lecture.',
        attachment: {
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
          name: 'JWT_Auth_Architecture_Diagram.png',
          fileType: 'image/png'
        },
        createdAt: new Date(now.getTime() - 8 * 60 * 60 * 1000)
      },
      {
        groupId: group3._id,
        senderId: admin._id,
        senderRole: 'admin',
        content: 'Please ensure your environment variables are configured before submitting your repository links. For 1-on-1 questions, reach out via the 1-on-1 Instructor chat tab.',
        createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
      }
    ]);

    console.log('👥 Created sample group chat messages with admin attachments.');
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// If run directly via `node src/seed.js`
if (process.argv[1]?.endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await closeDB();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
