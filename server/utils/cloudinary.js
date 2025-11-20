const cloudinary = require('cloudinary').v2;

// Configure from environment variables
// Required:
// - CLOUDINARY_CLOUD_NAME
// - CLOUDINARY_API_KEY
// - CLOUDINARY_API_SECRET
// Optional:
// - CLOUDINARY_SECURE=true
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: String(process.env.CLOUDINARY_SECURE || 'true') === 'true',
});

module.exports = { cloudinary };
