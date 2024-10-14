// frontend/src/services/api.js

import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = 'http://localhost:5000/api/files';

// Function to upload a file
export const uploadFile = async (file,onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress, // Pass the onUploadProgress callback
        });
        return response.data; // Return the response from the API
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

// Function to fetch the list of files
export const fetchFiles = async () => {
    try {
        const response = await axios.get(API_BASE_URL);
        return response.data; // Return the list of files
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
};

// frontend/src/services/api.js

// Function to delete a file by its public_id
export const deleteFile = async (publicId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/${publicId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export const getRootFolders = async () => {
    const response = await axios.get(`${API_BASE_URL}/folders`);
    return response.data;
};

export const getFilesInFolder = async (folderName) => {
    const response = await axios.get(`${API_BASE_URL}/files/folder/${folderName}`);
    return response.data;
};
