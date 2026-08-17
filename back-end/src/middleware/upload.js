const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Creates an isolated multer instance storing files under uploads/<subfolder>.
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

// Book covers and event images are served by the WEBSITE backend's
// express.static('/uploads') mount, not this (system) backend's own
// server — the two are separate Express apps that share one database
// but not one filesystem. So these uploaders must write straight into
// the website backend's uploads/ folder, or images saved here would
// simply never exist where the public site looks for them.
//
// Set WEBSITE_UPLOADS_PATH in this project's .env to the absolute path
// of the website backend's uploads folder, e.g. on Windows:
//   WEBSITE_UPLOADS_PATH=C:\Website\back-end\uploads
// or on Mac/Linux:
//   WEBSITE_UPLOADS_PATH=/Users/you/Website/back-end/uploads
//
// Falls back to this project's own local uploads/ folder (old behavior)
// if the env var isn't set, so nothing breaks before it's configured —
// but that fallback WILL keep reproducing the "image doesn't show on
// the site" bug, so make sure to set it.
const baseUploadsDir = process.env.WEBSITE_UPLOADS_PATH
  ? process.env.WEBSITE_UPLOADS_PATH
  : path.join(__dirname, '../../uploads');

if (!process.env.WEBSITE_UPLOADS_PATH) {
  console.warn(
    '⚠️  WEBSITE_UPLOADS_PATH is not set — book covers/event images will be ' +
    'saved to this backend\'s own uploads/ folder instead of the website\'s, ' +
    'and will NOT show up on the public site. Set WEBSITE_UPLOADS_PATH in .env.'
  );
}

module.exports = {
  uploadBookCover: makeUploader('covers', baseUploadsDir),
  uploadEventImage: makeUploader('events', baseUploadsDir),
};