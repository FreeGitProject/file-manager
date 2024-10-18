// backend/routes/fileRoutes.js

const express = require('express');
const { uploadFile, getFiles, deleteFile, getFilesInFolder, getRootFolders, createFolder, getSubFolders, deleteFolder, getResourcesByFolderPath, getResourcesByExternalId } = require('../controllers/fileController');
const multer = require('multer');
const { storage } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage });

// Route to upload a file
//router.post('/upload', upload.single('file'), uploadFile);
router.post('/uploadImage', upload.single('image'), uploadFile);
// Route to get the list of uploaded files
router.get('/', getFiles);
// Delete file route
router.delete('/deleteFile', deleteFile); // <-- New route for deleting a file by public ID

router.get('/files/folder/:folderName', getFilesInFolder); // New route for fetching files in a folder
// Define the route for fetching root folders
router.get('/getRootFolders', getRootFolders);
// Define the route for fetching subfolders of a specified parent folder
router.get('/getSubFolders', getSubFolders);
//router.post('/folders', createFolder); // New route for creating folders
// Route for creating a new folder
router.post('/createFolder', createFolder);
// Route for deleting a folder
router.delete('/deleteFolder', deleteFolder);
// Route for getting resources by folder_id
router.get('/getResourcesByFolderPath', getResourcesByFolderPath);

// Route for getting resources by external_id
router.get('/resources/by-external-id', getResourcesByExternalId);
module.exports = router;
