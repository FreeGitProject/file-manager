// backend/controllers/fileController.js

const { cloudinary } = require('../config/cloudinary');

// Handle file upload
const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = req.file.path;
    const fileSize = req.file.size; // Get file size

    res.status(200).json({
        message: 'File uploaded successfully',
        fileUrl,
        fileSize, // Include file size in response
    });
};

// Handle fetching the list of files
const getFiles = async (req, res) => {
    try {
        const { resources } = await cloudinary.search
            .expression('folder:file-manager') // Filter by folder
            .sort_by('public_id', 'desc')
            .max_results(30)
            .execute();

        const files = resources.map((file) => ({
            public_id: file.public_id,
            url: file.secure_url,
            size: file.bytes, // Get the file size in bytes from Cloudinary
        }));

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files', error });
    }
};

// Handle file deletion
const deleteFile = async (req, res) => {
    const publicId = req.params.public_id; // Get the file's public ID from the request parameters

    try {
        // Delete file from Cloudinary using its public ID
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            return res.status(200).json({ message: 'File deleted successfully' });
        } else {
            return res.status(400).json({ message: 'Failed to delete file' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting file', error });
    }
};
// Handle fetching the list of root folders
const getRootFolders = async (req, res) => {
    try {
        const { resources } = await cloudinary.search
            .expression('folder:file-manager/*') // Get all folders inside 'file-manager'
            .max_results(30)
            .execute();

        const folders = resources.map((folder) => ({
            public_id: folder.public_id,
            folder_name: folder.public_id.split('/')[1], // Extract folder name
        }));

        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching folders', error });
    }
};

// Handle fetching files in a specific folder
const getFilesInFolder = async (req, res) => {
    const { folderName } = req.params; // Get folder name from request parameters

    try {
        const { resources } = await cloudinary.search
            .expression(`folder:file-manager/${folderName}`) // Filter by folder name
            .sort_by('public_id', 'desc')
            .max_results(30)
            .execute();

        const files = resources.map((file) => ({
            public_id: file.public_id,
            url: file.secure_url,
            size: file.bytes, // Get the file size in bytes from Cloudinary
        }));

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching files', error });
    }
};

// Handle folder creation
const createFolder = async (req, res) => {
    const { folderName } = req.body; // Get folder name from the request body

    if (!folderName) {
        return res.status(400).json({ message: 'Folder name is required' });
    }

    try {
        // Cloudinary doesn't explicitly create folders, but it can be created by uploading a dummy image
        const response = await cloudinary.uploader.upload('data:image/gif;base64,R0lGODdhAQABAPAAAP8AAAAAACwAAAAAAQABAAACAkQBADs=', {
            folder: `file-manager/${folderName}`,
        });

        // Return success response
        res.status(201).json({ message: 'Folder created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating folder', error });
    }
};
module.exports = { uploadFile, getFiles,deleteFile , getRootFolders, getFilesInFolder ,createFolder  };
