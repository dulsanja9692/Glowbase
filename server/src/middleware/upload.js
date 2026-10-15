const multer = require("multer");

// Use memoryStorage so uploads are kept in memory as Buffers.
// This works seamlessly on Vercel, AWS Lambda, and containerized platforms
// where the local filesystem is read-only (EROFS).
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"));
}

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = upload;

