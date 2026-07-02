import express from 'express';
import multer from 'multer';
import { uploadImages } from '../controllers/upload.controller.js';
import verifyToken from '../utils/verifyUser.js';

const router = express.Router();

// Use memory storage to temporarily hold the file buffer before uploading to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit per file
});

// We name the field 'images' to match the frontend FormData payload
router.post('/', verifyToken, upload.array('images', 6), uploadImages);

export default router;
