import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_mgmt_db',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-student-mgmt-2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  ADMIN_DEFAULT_ID: process.env.ADMIN_DEFAULT_ID || 'admin-profpankaj25',
  ADMIN_DEFAULT_PASSWORD: process.env.ADMIN_DEFAULT_PASSWORD || 'pass1225',
  ADMIN_NAME: process.env.ADMIN_NAME || 'Prof. Pankaj Sharma',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'prof.pankaj@university.edu',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173'
};
