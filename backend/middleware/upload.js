const multer = require('multer');
const path = require('path');
const AppError = require('../utils/appError');

// Multer config
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else if (file.mimetype.startsWith('video')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image or video! Please upload only images or videos.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files
  }
});

// Different upload configurations
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

const uploadMultiple = (fieldName, maxCount = 5) => {
  return upload.array(fieldName, maxCount);
};

const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Profile picture upload
const uploadProfilePicture = uploadSingle('profilePic');

// Exercise demo video upload
const uploadExerciseVideo = uploadSingle('demoVideo');

// Progress photos upload
const uploadProgressPhotos = uploadMultiple('photos', 10);

// Mixed upload for exercises (images and videos)
const uploadExerciseMedia = uploadFields([
  { name: 'images', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File too large. Maximum size is 50MB.', 400));
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return next(new AppError('Too many files. Maximum is 5 files.', 400));
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new AppError('Unexpected field name for file upload.', 400));
    }
  }
  next(error);
};

// File validation middleware
const validateFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return next(new AppError('No file uploaded', 400));
  }
  
  // Validate file types
  const validateFileType = (file) => {
    const allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const allowedVideoTypes = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (file.mimetype.startsWith('image')) {
      return allowedImageTypes.includes(fileExtension);
    } else if (file.mimetype.startsWith('video')) {
      return allowedVideoTypes.includes(fileExtension);
    }
    
    return false;
  };
  
  if (req.file) {
    if (!validateFileType(req.file)) {
      return next(new AppError('Invalid file type', 400));
    }
  }
  
  if (req.files) {
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        if (!validateFileType(file)) {
          return next(new AppError('Invalid file type', 400));
        }
      }
    } else {
      // req.files is an object with field names as keys
      for (const fieldName in req.files) {
        for (const file of req.files[fieldName]) {
          if (!validateFileType(file)) {
            return next(new AppError('Invalid file type', 400));
          }
        }
      }
    }
  }
  
  next();
};

// Resize images middleware (optional, requires sharp)
const resizeImages = (width, height, quality = 90) => {
  return async (req, res, next) => {
    if (!req.files || !Array.isArray(req.files)) return next();
    
    try {
      // This would require the sharp package
      // const sharp = require('sharp');
      
      // req.files = await Promise.all(
      //   req.files.map(async (file) => {
      //     if (file.mimetype.startsWith('image')) {
      //       file.buffer = await sharp(file.buffer)
      //         .resize(width, height)
      //         .jpeg({ quality })
      //         .toBuffer();
      //     }
      //     return file;
      //   })
      // );
      
      next();
    } catch (error) {
      next(new AppError('Error processing images', 500));
    }
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadProfilePicture,
  uploadExerciseVideo,
  uploadProgressPhotos,
  uploadExerciseMedia,
  handleMulterError,
  validateFile,
  resizeImages
};
