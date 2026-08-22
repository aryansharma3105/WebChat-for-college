import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ENV } from '../config/env.js';

// Ensure upload directories exist
const uploadDir = ENV.UPLOAD_DIR;
const dirs = ['assignments', 'submissions', 'notes', 'avatars', 'attachments'];

dirs.forEach((subDir) => {
  const dirPath = path.join(uploadDir, subDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'attachments';
    if (req.baseUrl.includes('assignment')) folder = 'assignments';
    else if (req.baseUrl.includes('submission')) folder = 'submissions';
    else if (req.baseUrl.includes('note')) folder = 'notes';
    else if (req.baseUrl.includes('auth') || req.baseUrl.includes('student')) folder = 'avatars';

    const dest = path.join(uploadDir, folder);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// File filter for safety
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip|rar|png|jpg|jpeg|gif|webp|svg|csv|py|java|cpp|c|js|html|css|json/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  
  if (extname) {
    return cb(null, true);
  }
  cb(new Error(`File format ${path.extname(file.originalname)} is not allowed. Only academic documents, archives, code files, and images are permitted.`));
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter
});
