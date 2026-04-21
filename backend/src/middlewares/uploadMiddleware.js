import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'avatar') {
      const avatarDir = path.join(uploadDir, 'avatars');
      if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });
      cb(null, avatarDir);
    } else {
      const productDir = path.join(uploadDir, 'products');
      if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });
      cb(null, productDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename by replacing problematic characters with dashes
    let safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '-');
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + safeName);
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, PNG, WEBP) yang diizinkan!'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});
