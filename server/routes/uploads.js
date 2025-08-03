const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AppError, catchAsync } = require("../middleware/errorHandler");

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, file.fieldname);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    avatars: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    documents: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  };

  const fieldAllowedTypes =
    allowedTypes[file.fieldname] || allowedTypes["images"];

  if (fieldAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type for ${file.fieldname}. Allowed types: ${fieldAllowedTypes.join(", ")}`,
        400,
        "INVALID_FILE_TYPE",
      ),
      false,
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Max 5 files per request
  },
});

// Upload avatar
router.post(
  "/avatar",
  upload.single("avatars"),
  catchAsync(async (req, res) => {
    if (!req.file) {
      throw new AppError("No file uploaded", 400, "NO_FILE");
    }

    const fileUrl = `/uploads/avatars/${req.file.filename}`;

    // TODO: Update user avatar in database
    // await db.run('UPDATE users SET avatar = ? WHERE id = ?', [fileUrl, req.user.id]);

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  }),
);

// Upload images (for blog posts, etc.)
router.post(
  "/images",
  upload.array("images", 5),
  catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files uploaded", 400, "NO_FILES");
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/images/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname,
    }));

    res.json({
      success: true,
      message: "Images uploaded successfully",
      data: { files: uploadedFiles },
    });
  }),
);

// Upload documents
router.post(
  "/documents",
  upload.array("documents", 3),
  catchAsync(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError("No files uploaded", 400, "NO_FILES");
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      url: `/uploads/documents/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      originalName: file.originalname,
    }));

    res.json({
      success: true,
      message: "Documents uploaded successfully",
      data: { files: uploadedFiles },
    });
  }),
);

// Get file info
router.get(
  "/info/:type/:filename",
  catchAsync(async (req, res) => {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);

    if (!fs.existsSync(filePath)) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    const stats = fs.statSync(filePath);

    res.json({
      success: true,
      data: {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${type}/${filename}`,
      },
    });
  }),
);

// Delete file
router.delete(
  "/:type/:filename",
  catchAsync(async (req, res) => {
    const { type, filename } = req.params;
    const filePath = path.join(uploadsDir, type, filename);

    if (!fs.existsSync(filePath)) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    // TODO: Check if user owns the file or is admin
    // const fileOwner = await checkFileOwnership(filename, req.user.id);
    // if (!fileOwner && !req.user.isAdmin) {
    //   throw new AppError('Access denied', 403, 'ACCESS_DENIED');
    // }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  }),
);

// Get upload statistics
router.get(
  "/stats",
  catchAsync(async (req, res) => {
    const types = ["avatars", "images", "documents"];
    const stats = {};

    for (const type of types) {
      const typeDir = path.join(uploadsDir, type);
      if (fs.existsSync(typeDir)) {
        const files = fs.readdirSync(typeDir);
        let totalSize = 0;

        files.forEach((file) => {
          const filePath = path.join(typeDir, file);
          const stat = fs.statSync(filePath);
          totalSize += stat.size;
        });

        stats[type] = {
          count: files.length,
          totalSize,
          totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
        };
      } else {
        stats[type] = { count: 0, totalSize: 0, totalSizeMB: 0 };
      }
    }

    res.json({
      success: true,
      data: { stats },
    });
  }),
);

module.exports = router;
