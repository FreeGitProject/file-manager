import axios from 'axios';

// Define the base URL for the API
const API_BASE_URL = 'http://localhost:5000/api/folders';

// Function to get all root folders
export const getRootFolders = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data; // Return root folders
    } catch (error) {
        console.error('Error fetching root folders:', error);
        throw error;
    }
};

// Function to get all subfolders for a specific folder
export const getSubFolders = async (folder, max_results = 10, next_cursor = '') => {
    try {
        const response = await axios.get(`${API_BASE_URL}/${folder}`, {
            params: { max_results, next_cursor }
        });
        return response.data; // Return subfolders with pagination support
    } catch (error) {
        console.error('Error fetching subfolders:', error);
        throw error;
    }
};

// Function to create a new folder
export const createFolder = async (folderName) => {
    try {
        const response = await axios.post(`${API_BASE_URL}`, { folder: folderName });
        return response.data; // Return success response
    } catch (error) {
        console.error('Error creating folder:', error);
        throw error;
    }
};

// Function to delete a folder
export const deleteFolder = async (folderName) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}`, { data: { folder: folderName } });
        return response.data; // Return success response for folder deletion
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw error;
    }
};

// Function to get resources by folder path
export const getResourcesByFolderPath = async (folderPath) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/resources`, {
            params: { folder_path: folderPath }
        });
        return response.data; // Return resources in the folder
    } catch (error) {
        console.error('Error fetching resources:', error);
        throw error;
    }
};
