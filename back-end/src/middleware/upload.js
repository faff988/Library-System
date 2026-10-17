require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeUploader(subfolder, baseUploadsDir) {
  const uploadDir = path.join(baseUploadsDir, subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
}

const baseUploadsDir = process.env.WEBSITE_UPLOADS_PATH
  ? path.resolve(process.env.WEBSITE_UPLOADS_PATH)
  : path.join(__dirname, '../../uploads');

if (!process.env.WEBSITE_UPLOADS_PATH) {
  console.warn(
    '⚠️  WEBSITE_UPLOADS_PATH is not set — book covers/event images will be ' +
    'saved to this backend\'s own uploads/ folder instead of the website\'s, ' +
    'and will NOT show up on the public site. Set WEBSITE_UPLOADS_PATH in .env.'
  );
}

module.exports = {
  baseUploadsDir,
  uploadBookCover: makeUploader('covers', baseUploadsDir),
  uploadEventImage: makeUploader('events', baseUploadsDir),
};