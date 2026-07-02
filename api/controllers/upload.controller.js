import { v2 as cloudinary } from 'cloudinary';

export const uploadImages = async (req, res, next) => {
  // Configure Cloudinary dynamically from environment variables
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'neelstate' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);
    res.status(200).json({ success: true, urls });
  } catch (error) {
    next(error);
  }
};
