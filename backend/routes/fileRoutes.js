// backend/routes/fileRoutes.js

const express = require('express');
const { uploadFile, getFiles, deleteFile, getFilesInFolder, getRootFolders } = require('../controllers/fileController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage });

// Route to upload a file
router.post('/upload', upload.single('file'), uploadFile);

// Route to get the list of uploaded files
router.get('/', getFiles);
// Delete file route
router.delete('/:public_id', deleteFile); // <-- New route for deleting a file by public ID
router.get('/folders', getRootFolders); // New route for fetching folders
router.get('/files/folder/:folderName', getFilesInFolder); // New route for fetching files in a folder


module.exports = router;
