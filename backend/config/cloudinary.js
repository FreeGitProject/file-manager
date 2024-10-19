// backend/config/cloudinary.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log(process.env.CLOUDINARY_API_KEY, "CloudinaryStorage");
// Define Cloudinary storage settings
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req, file) => (req.query.folder === "Home" ? "" : req.query.folder), // Using req.query for folder
    allowed_formats: ["jpg", "png", "pdf", "docx", "gif"], // Define file types
    public_id: (req, file) => file.originalname.split(".")[0], // Use original file name
  },
});

module.exports = { cloudinary, storage };
