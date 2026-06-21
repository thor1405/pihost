import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getFiles, uploadFile, deleteFile } from '../controllers/storageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storageDir = path.join(process.cwd(), 'storage');
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const upload = multer({ 
  dest: 'storage/',
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for general storage
});

router.route('/')
  .get(protect, getFiles)
  .post(protect, upload.single('file'), uploadFile);

router.route('/:id')
  .delete(protect, deleteFile);

export default router;
