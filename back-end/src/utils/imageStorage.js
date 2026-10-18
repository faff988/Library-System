// src/utils/imageStorage.js
// Cloudinary upload/delete helpers. Also understands "legacy" values (plain
// filenames saved before the move to Cloudinary) so old records keep working.
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Cloudinary credentials are missing (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). Image uploads will fail.');
}

// Old local-disk location, only used to delete legacy files.
const legacyBaseDir = process.env.WEBSITE_UPLOADS_PATH
  ? path.resolve(process.env.WEBSITE_UPLOADS_PATH)
  : path.join(__dirname, '../../uploads');

function isUrl(value) {
  return /^https?:\/\//i.test(value || '');
}

// Uploads an in-memory file to Cloudinary under library/<folder>.
function uploadBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `library/${folder}`, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// https://res.cloudinary.com/<cloud>/image/upload/v123/library/covers/abc.jpg
//   -> library/covers/abc
function publicIdFromUrl(url) {
  const match = String(url).match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

// Deletes a stored image. `value` is whatever is saved in the database:
// a Cloudinary URL (new) or a plain filename (legacy local file).
function deleteStoredImage(value, folder) {
  if (!value) return;

  if (isUrl(value)) {
    const publicId = publicIdFromUrl(value);
    if (!publicId) return;
    cloudinary.uploader.destroy(publicId).catch((err) => {
      console.warn('⚠️ Failed to delete Cloudinary image:', publicId, err.message);
    });
    return;
  }

  const filePath = path.join(legacyBaseDir, folder, value);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn('⚠️ Failed to delete local image file:', filePath, err.message);
    }
  });
}

// Value to return to the front-end: full URL as-is, or the legacy /uploads path.
function imageUrl(value, folder) {
  if (!value) return null;
  return isUrl(value) ? value : `/uploads/${folder}/${value}`;
}

module.exports = { uploadBuffer, deleteStoredImage, imageUrl, isUrl };