const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Creates an isolated multer instance storing files under uploads/<subfolder>.
// All subfolders are served by the single express.static('/uploads') mount
// already set up in server.js, so adding a new upload category here needs
// no server.js change.
function makeUploader(subfolder) {
  const uploadDir = path.join(__dirname, '../../uploads', subfolder);
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

module.exports = {
  uploadBookCover: makeUploader('covers'),
  uploadEventImage: makeUploader('events'),
};