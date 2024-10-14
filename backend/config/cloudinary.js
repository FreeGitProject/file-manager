// backend/config/cloudinary.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log(process.env.CLOUDINARY_API_KEY,"sdf");
// Define Cloudinary storage settings
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'file-manager',  // The folder where files will be uploaded in Cloudinary
        allowed_formats: ['jpg', 'png', 'pdf', 'docx'],  // Define file types
    },
});

module.exports = { cloudinary, storage };
