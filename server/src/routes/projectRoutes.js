import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getProjects, createProject, deployProject, deleteProject } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Setup Multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const isZip = file.mimetype === 'application/zip' || 
                  file.mimetype === 'application/x-zip-compressed' || 
                  file.mimetype === 'application/octet-stream' ||
                  file.originalname.endsWith('.zip');
                  
    if (isZip) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip files are allowed'));
    }
  }
});

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .delete(protect, deleteProject);

router.post('/:id/deploy', protect, upload.single('file'), deployProject);

export default router;
