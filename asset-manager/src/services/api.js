import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/files";

// Fetch root folders
export const getRootFolders = async () => {
  const response = await axios.get(`${API_BASE_URL}/getRootFolders`);
  return response.data;
};

// Fetch subfolders
export const getSubFolders = async (folderPath) => {
  //const response = await axios.get(`${API_BASE_URL}/getSubFolders/${folderPath}`);
  const response = await axios.get(`${API_BASE_URL}/getSubFolders`, {
    params: { folder: folderPath },
  });
  return response.data.subfolders;
};

// Fetch resources (files) by folder path
export const getResourcesByFolderPath = async (folderPath) => {
  const response = await axios.get(`${API_BASE_URL}/getResourcesByFolderPath`, {
    params: { folder_path: folderPath },
  });
  return response.data.resources;
};
// Fetch resources (files) by folder path with pagination
export const getResourcesByPaginationFolderPath = async (folderPath, maxResults = 10, nextCursor = null) => {
  const response = await axios.get(`${API_BASE_URL}/getResourcesByPaginationFolderPath`, {
    params: {
      folder_path: folderPath,
      max_results: maxResults,
      next_cursor: nextCursor
    },
  });
  return response.data;
};
// Create a new folder
export const createFolder = async (folderName) => {
  const response = await axios.post(`${API_BASE_URL}/createFolder`, {
    folder: folderName,
  });
  return response.data;
};

// Delete a folder
export const deleteFolder = async (folderPath) => {
  const response = await axios.delete(`${API_BASE_URL}/deleteFolder`, {
    params: { folder: folderPath },
  });
  return response.data;
};
// export const uploadImageToFolder = async (formData) => {
//   const response = await axios.post(`${API_BASE_URL}/uploadImage`, formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });
//   //console.log(response.data)
//   return response.data;
// };
// Modify uploadImageToFolder to accept folder as query
export const uploadImageToFolder = async (formData, folder) => {
  const response = await axios.post(
    `${API_BASE_URL}/uploadImage?folder=${folder}`, // Send folder in query
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};
// Delete file by public_id
export const deleteFileByPublicId = async (publicId) => {
  const response = await axios.delete(`${API_BASE_URL}/deleteFile`, {
    params: { public_id: publicId },
  });
  return response.data;
};
//
// Fetch root folders
export const rootResources = async () => {
  const response = await axios.get(`${API_BASE_URL}/root-resources `);
  return response.data;
};
// Fetch root folders
export const rootResourcesWithPagination = async ( maxResults = 10, nextCursor = null) => {
  const response = await axios.get(`${API_BASE_URL}/root-resources-pagination`,{
    params: {
      max_results: maxResults,
      next_cursor: nextCursor
    },
  });
  return response.data;
};
// Search resources by filename or public ID
export const searchResources = async (searchQuery, selectedFolder) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/search-resources`, {
      query: searchQuery,
      folder_path: selectedFolder,
    });
    return response.data;
  } catch (error) {
    console.error("Error searching files:", error);
    throw error;
  }
};

export const  renameFileById = async (asset_id, newName) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/renameFile`, {
      asset_id,
      newName
    });
    // if (response.data.success) {
    //   alert(response.data.message);
    // }
    return response.data;
  } catch (error) {
    console.error('Error renaming file:', error);
  }
};
