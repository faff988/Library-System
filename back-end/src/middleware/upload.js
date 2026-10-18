// require('dotenv').config();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// function makeUploader(subfolder, baseUploadsDir) {
//   const uploadDir = path.join(baseUploadsDir, subfolder);
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
//   }

//   const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) => {
//       const ext = path.extname(file.originalname);
//       const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       cb(null, `${unique}${ext}`);
//     },
//   });

//   const fileFilter = (req, file, cb) => {
//     const allowed = ['image/jpeg', 'image/png', 'image/webp'];
//     if (allowed.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
//     }
//   };

//   return multer({
//     storage,
//     fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   });
// }

// const baseUploadsDir = process.env.WEBSITE_UPLOADS_PATH
//   ? path.resolve(process.env.WEBSITE_UPLOADS_PATH)
//   : path.join(__dirname, '../../uploads');

// if (!process.env.WEBSITE_UPLOADS_PATH) {
//   console.warn(
//     '⚠️  WEBSITE_UPLOADS_PATH is not set — book covers/event images will be ' +
//     'saved to this backend\'s own uploads/ folder instead of the website\'s, ' +
//     'and will NOT show up on the public site. Set WEBSITE_UPLOADS_PATH in .env.'
//   );
// }

// module.exports = {
//   baseUploadsDir,
//   uploadBookCover: makeUploader('covers', baseUploadsDir),
//   uploadEventImage: makeUploader('events', baseUploadsDir),
// };

// src/middleware/upload.js
// Receives the image in memory (multer), then sends it to Cloudinary. After
// this runs, req.file.filename holds the full Cloudinary URL, so the
// controllers keep saving `req.file.filename` exactly as before.
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const { uploadBuffer } = require('../utils/imageStorage');

// Still exported because server.js serves it for legacy local files in dev.
const baseUploadsDir = process.env.WEBSITE_UPLOADS_PATH
  ? path.resolve(process.env.WEBSITE_UPLOADS_PATH)
  : path.join(__dirname, '../../uploads');

function makeUploader(folder) {
  const parser = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });

  const sendToCloudinary = async (req, res, next) => {
    if (!req.file) return next();
    try {
      const result = await uploadBuffer(req.file.buffer, folder);
      req.file.filename = result.secure_url; // full https URL
      next();
    } catch (err) {
      console.error('Cloudinary upload failed:', err);
      next(new Error('Image upload failed. Please try again.'));
    }
  };

  // Routes keep calling uploadBookCover.single('coverImage'); Express
  // accepts an array of middleware, so nothing in the routes changes.
  return { single: (field) => [parser.single(field), sendToCloudinary] };
}

module.exports = {
  baseUploadsDir,
  uploadBookCover: makeUploader('covers'),
  uploadEventImage: makeUploader('events'),
};