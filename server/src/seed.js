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
    console.log('🌱 Seeding database (Clean initial setup)...');

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
    const admin = await User.create({
      customId: ENV.ADMIN_DEFAULT_ID || 'Pankaj1478',
      name: ENV.ADMIN_NAME || 'Prof. Pankaj Sharma',
      email: ENV.ADMIN_EMAIL || 'prof.pankaj@university.edu',
      role: 'admin',
      password: ENV.ADMIN_DEFAULT_PASSWORD || 'pass1225',
      department: 'Department of Computer Science',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    console.log(`👤 Admin created: ${admin.name} (ID: ${admin.customId})`);

    // 2. Create Base Groups / Cohorts
    const group1 = await Group.create({
      groupName: 'Computer Science - Section A',
      description: 'Core batch for 3rd Year B.Tech Computer Science students.',
      color: '#4F46E5', // Indigo
      createdBy: admin._id,
      members: []
    });

    const group2 = await Group.create({
      groupName: 'Data Structures & Algorithms Lab',
      description: 'Weekly practical lab sessions and algorithmic problem sets.',
      color: '#059669', // Emerald
      createdBy: admin._id,
      members: []
    });

    const group3 = await Group.create({
      groupName: 'Web Development & Cloud Computing',
      description: 'Full-stack MERN, REST APIs, Microservices, and Cloud deployment.',
      color: '#D97706', // Amber
      createdBy: admin._id,
      members: []
    });

    const group4 = await Group.create({
      groupName: 'Database Management Systems (DBMS)',
      description: 'Relational DBs, Normalization, SQL, and NoSQL systems.',
      color: '#9333EA', // Purple
      createdBy: admin._id,
      members: []
    });

    console.log('👥 Created 4 academic cohorts.');

    // 3. Create Sample Study Materials & Notes (Clean templates)
    await Note.create([
      {
        title: 'Welcome: Academic Semester Syllabus & Guidelines',
        description: 'Semester guidelines, lab instructions, and grading scheme for all enrolled students.',
        groupId: group1._id,
        isAnnouncement: true,
        fileType: 'announcement',
        uploadedBy: admin._id
      },
      {
        title: 'DSA Lab: Data Structures Quick Reference Guide',
        description: 'Reference sheet covering Big-O notation, tree balancing, and graph traversals.',
        groupId: group2._id,
        fileType: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'DSA_Reference_Guide.pdf',
        uploadedBy: admin._id
      },
      {
        title: 'DBMS Normalization Cheatsheet (1NF to BCNF)',
        description: 'Worked examples of schema decomposition and dependency preservation.',
        groupId: group4._id,
        fileType: 'pdf',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: 'DBMS_Normalization_CheatSheet.pdf',
        uploadedBy: admin._id
      }
    ]);

    console.log('📚 Created study materials & announcements.');

    // 4. Create Initial Assignment Templates (NO fake submissions, NO fake marks, NO fake queries)
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

    await Assignment.create([
      {
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
      },
      {
        title: 'DBMS Lab Project: Relational Database Schema & Queries',
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
      }
    ]);

    console.log('📝 Created clean assignment templates.');
    console.log('✅ Clean database seeding complete! Submissions, queries, marks, and chats are 100% clean.');
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
