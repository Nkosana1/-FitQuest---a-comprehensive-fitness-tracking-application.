const cloudinary = require('cloudinary').v2;
const AppError = require('./appError');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload single file to Cloudinary
const uploadSingle = async (file, folder = 'fitquest') => {
  try {
    const result = await cloudinary.uploader.upload(file.path || `data:${file.mimetype};base64,${file.buffer.toString('base64')}`, {
      folder,
      resource_type: 'auto', // Automatically detect file type
      transformation: file.mimetype.startsWith('image') ? [
        { width: 1000, height: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ] : undefined
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new AppError('File upload failed', 500);
  }
};

// Upload multiple files to Cloudinary
const uploadMultiple = async (files, folder = 'fitquest') => {
  try {
    const uploadPromises = files.map(file => uploadSingle(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    throw new AppError('File upload failed', 500);
  }
};

// Delete file from Cloudinary
const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new AppError('File deletion failed', 500);
  }
};

// Delete multiple files from Cloudinary
const deleteMultiple = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    console.error('Cloudinary multiple delete error:', error);
    throw new AppError('File deletion failed', 500);
  }
};

// Generate video thumbnail
const generateVideoThumbnail = async (videoPublicId) => {
  try {
    const thumbnailUrl = cloudinary.url(videoPublicId, {
      resource_type: 'video',
      format: 'jpg',
      transformation: [
        { width: 300, height: 200, crop: 'fill' },
        { start_offset: '10%' } // Take thumbnail at 10% of video duration
      ]
    });

    return thumbnailUrl;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new AppError('Thumbnail generation failed', 500);
  }
};

// Get file info from Cloudinary
const getFileInfo = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    console.error('Get file info error:', error);
    throw new AppError('File info retrieval failed', 500);
  }
};

// Create signed upload URL for frontend direct uploads
const createSignedUploadUrl = (folder = 'fitquest', resourceType = 'auto') => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  
  const params = {
    timestamp,
    folder,
    resource_type: resourceType
  };

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    params: {
      ...params,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY
    }
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteFile,
  deleteMultiple,
  generateVideoThumbnail,
  getFileInfo,
  createSignedUploadUrl,
  cloudinary
};
