import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/files';

// Fetch root folders
export const getRootFolders = async () => {
  const response = await axios.get(`${API_BASE_URL}/getRootFolders`);
  return response.data;
};

// Fetch subfolders
export const getSubFolders = async (folderPath) => {
  const response = await axios.get(`${API_BASE_URL}/getSubFolders/${folderPath}`);
  //const response = await axios.get(`${API_BASE_URL}/getSubFolders`,{ folder: folderPath });
  return response.data.subfolders;
};

// Fetch resources (files) by folder path
export const getResourcesByFolderPath = async (folderPath) => {
  const response = await axios.get(`${API_BASE_URL}/getResourcesByFolderPath`, {
    params: { folder_path: folderPath }
  });
  return response.data.resources;
};

// Create a new folder
export const createFolder = async (folderName) => {
  const response = await axios.post(`${API_BASE_URL}/createFolder`, { folder: folderName });
  return response.data;
};

// Delete a folder
export const deleteFolder = async (folderPath) => {
  const response = await axios.post(`${API_BASE_URL}/deleteFolder`, { folder: folderPath });
  return response.data;
};
