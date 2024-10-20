// backend/controllers/fileController.js

const { cloudinary } = require("../config/cloudinary");

// Handle file upload
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileUrl = req.file.path;
  const fileSize = req.file.size; // Get file size

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    fileUrl,
    fileSize, // Include file size in response
  });
};

// Handle fetching the list of files root-Resources
const rootResources = async (req, res) => {
  try {
    const { resources } = await cloudinary.search
      .expression('folder:""') // Filter by folder
      .sort_by("public_id", "desc")
      .max_results(500)
      .execute();

    // const files = resources.map((file) => ({
    //     public_id: file.public_id,
    //     url: file.secure_url,
    //     size: file.bytes, // Get the file size in bytes from Cloudinary
    //     folder:file.folder
    // }));

    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Error fetching files", error });
  }
};

// Handle file deletion
const deleteFile = async (req, res) => {
  const { public_id } = req.query; // Get the file's public ID from the request parameters

  if (!public_id) {
    return res
      .status(400)
      .json({ success: false, message: "Public ID is required" });
  }
  try {
    // Delete file from Cloudinary using its public ID
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === "ok") {
      return res
        .status(200)
        .json({ success: true, message: "File deleted successfully" });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Failed to delete file" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error deleting file", error });
  }
};
// Handle fetching the list of root folders
// const getRootFolders = async (req, res) => {
//     try {
//         const { resources } = await cloudinary.search
//             .expression('folder:file-manager/*') // Get all folders inside 'file-manager'
//             .max_results(30)
//             .execute();

//         const folders = resources.map((folder) => ({
//             public_id: folder.public_id,
//             folder_name: folder.public_id.split('/')[1], // Extract folder name
//         }));

//         res.status(200).json(folders);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching folders', error });
//     }
// };

// Handle fetching files in a specific folder
const getFilesInFolder = async (req, res) => {
  const { folderName } = req.params; // Get folder name from request parameters

  try {
    // If folderName is empty or undefined, search the root folder
    const searchExpression =
      folderName && folderName !== "null" && folderName !== "undefined"
        ? `folder:file-manager/${folderName}` // If folder name exists
        : "folder:file-manager"; // If folder name is empty (root folder)

    const { resources } = await cloudinary.search
      .expression(searchExpression) // Filter by folder name or root folder
      .sort_by("public_id", "desc")
      .max_results(30)
      .execute();

    const files = resources.map((file) => ({
      public_id: file.public_id,
      url: file.secure_url,
      size: file.bytes, // Get the file size in bytes from Cloudinary
    }));

    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ message: "Error fetching files", error });
  }
};

// Handle creating a new folder in Cloudinary
const createFolder = async (req, res) => {
  //const { folder } = req.params; // Get folder name from request parameters
  const { folder } = req.body; // Get folder name from the request body
  try {
    // Ensure the folder name is provided
    if (!folder) {
      return res
        .status(400)
        .json({ success: false, message: "Folder name is required." });
    }
    // Create a new folder in Cloudinary
    const result = await cloudinary.api.create_folder(folder);

    res.status(200).json({
      success: true,
      path: result.path,
      name: result.name,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating folder",
      error: error.message || error,
    });
  }
};
// Handle folder creation
// const createFolder = async (req, res) => {
//     const { folderName } = req.body; // Get folder name from the request body

//     if (!folderName) {
//         return res.status(400).json({ message: 'Folder name is required' });
//     }

//     try {
//         // Cloudinary doesn't explicitly create folders, but it can be created by uploading a dummy image
//         const response = await cloudinary.uploader.upload('data:image/gif;base64,R0lGODdhAQABAPAAAP8AAAAAACwAAAAAAQABAAACAkQBADs=', {
//             folder: `file-manager/${folderName}`,
//         });

//         // Return success response
//         res.status(201).json({ message: 'Folder created successfully' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error creating folder', error });
//     }
// };

// Handle fetching root folders
const getRootFolders = async (req, res) => {
  try {
    const response = await cloudinary.api.root_folders();

    // Extract folders from the response
    const folders = response.folders.map((folder) => ({
      name: folder.name,
      path: folder.path,
      external_id: folder.external_id,
    }));

    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching root folders", error });
  }
};
// Handle fetching subfolders for a specified parent folder
// const getSubFolders = async (req, res) => {
//     const { folder } = req.params; // Get folder name from request parameters

//     try {
//         // Fetch subfolders from Cloudinary
//         const response = await cloudinary.api.sub_folders(folder);

//         // Extract subfolders from the response
//         const subfolders = response.folders.map((subfolder) => ({
//             name: subfolder.name,
//             path: subfolder.path,
//             external_id: subfolder.external_id,
//         }));

//         res.status(200).json(subfolders);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching subfolders', error });
//     }
// };
// Handle fetching subfolders for a specified parent folder
const getSubFolders = async (req, res) => {
  //  const { folder } = req.params; // Get folder name from request parameters
  //const { folder } = req.body;// Get folder name from request parameters
  const { folder } = req.query; // Get folder name from request parameters
  const { max_results = 10, next_cursor } = req.query; // Optional query parameters with default max_results

  try {
    // Prepare options with pagination support
    const options = {
      max_results: parseInt(max_results, 10), // Convert to an integer
    };
    if (next_cursor) options.next_cursor = next_cursor; // Add next_cursor if provided

    // Fetch subfolders from Cloudinary with optional pagination
    const response = await cloudinary.api.sub_folders(folder, options);

    // Extract subfolders from the response
    const subfolders = response.folders.map((subfolder) => ({
      name: subfolder.name,
      path: subfolder.path,
      external_id: subfolder.external_id,
    }));

    res.status(200).json({
      subfolders,
      next_cursor: response.next_cursor,
      total_count: response.total_count,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subfolders", error });
  }
};
const deleteFolder = async (req, res) => {
  //const { folder } = req.body; // Get folder name from the request body
  const { folder } = req.query;
  try {
    // Ensure the folder name is provided
    if (!folder) {
      return res
        .status(400)
        .json({ success: false, message: "Folder name is required." });
    }
    const result = await cloudinary.api.delete_folder(folder);

    res.status(200).json({
      success: true,
      deleted: result.deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting folder",
      error: error.message || error,
    });
  }
};

const getResourcesByFolderPath = async (req, res) => {
  const { folder_path } = req.query; // Get folder_path from query parameters
  const sort_by = "uploaded_at";
  const max_results = 500;

  //Ensure folder_path is provided
  if (!folder_path) {
    return res
      .status(400)
      .json({ success: false, message: "folder_path is required." });
  }

  try {
    // Fetch resources from Cloudinary using the folder_path as prefix
    const result = await cloudinary.api.resources({
      type: "upload", // Change to the resource type you're interested in
      prefix: folder_path, // Use the folder_path as the prefix
      max_results: max_results,
      sort_by: sort_by,
    });

    res.status(200).json({
      success: true,
      resources: result.resources,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching resources",
      error: error.message || error,
    });
  }
};
const getResourcesByPaginationFolderPath = async (req, res) => {
  const sort_by = "uploaded_at";
  const { folder_path, max_results = 10, next_cursor } = req.query; // Optional query parameters with default max_results
  //Ensure folder_path is provided
  if (!folder_path) {
    return res
      .status(400)
      .json({ success: false, message: "folder_path is required." });
  }

  try {
    // Fetch resources from Cloudinary using the folder_path as prefix
    const result = await cloudinary.api.resources({
      type: "upload", // Change to the resource type you're interested in
      prefix: folder_path, // Use the folder_path as the prefix
      max_results: max_results,
      sort_by: sort_by,
      next_cursor: next_cursor,
    });

    res.status(200).json({
      success: true,
      resources: result.resources,
      next_cursor: result.next_cursor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching resources",
      error: error.message || error,
    });
  }
};

// Handle searching files based on a query
const searchResources = async (req, res) => {
  try {
    const { query, folder_path } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    // Construct the search expression to include folder and query
    let searchExpression = `resource_type:image`;
    let effectiveFolderPath = folder_path; // Use a new variable to handle folder_path

    // If a folder is provided, add it to the search expression
    if (effectiveFolderPath) {
      if (effectiveFolderPath === "Home") {
        effectiveFolderPath = '""'; // Reset effectiveFolderPath if it's "Home"
      }
      searchExpression += ` AND folder:${effectiveFolderPath}`; // Add folder to search expression
    }

    // Use OR condition to search either by filename or full public_id
    searchExpression += ` AND (public_id:${query} OR filename:${query})`;

    // Execute the search with the constructed expression
    const { resources } = await cloudinary.search
      .expression(searchExpression)
      .sort_by("public_id", "desc")
      .max_results(50)
      .execute();

    res.status(200).json(resources);
  } catch (error) {
    console.error("Error during search:", error);
    res.status(500).json({ message: "Error searching files", error });
  }
};
// Rename a file by asset_id
const renameFile = async (req, res) => {
    try {
      const { asset_id, newName } = req.body;
  
      if (!asset_id || !newName) {
        return res.status(400).json({ success: false, message: 'Asset ID and new name are required' });
      }
  
      // Find the file by asset_id and rename it
      const file = await cloudinary.api.resource_by_asset_id(asset_id);
  
      if (!file) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }
        // Extract the current folder path from the public_id
        const currentFolderPath1 = file.public_id.substring(0, file.public_id.lastIndexOf("/"));
        const currentFolderPath = file.folder;

        // Combine the current folder path with the new name
        let newFullPath='';
        if(currentFolderPath)
         newFullPath = `${currentFolderPath}/${newName}`;
        else
        newFullPath=newName;
      // Rename the file
      const renamedFile = await cloudinary.uploader.rename(file.public_id, newFullPath);
  
      res.status(200).json({
        success: true,
        message: 'File renamed successfully',
        renamedFile
      });
    } catch (error) {
      console.error('Error renaming file:', error);
      res.status(500).json({ success: false, message: 'An error occurred while renaming the file' });
    }
  };
// Sample folders (this would typically come from your database or a service)
const folders = [
  {
    name: "avatars",
    path: "avatars",
    external_id: "c88bd8cd768958f4518633ced4e173e5eb",
  },
  {
    name: "courses",
    path: "courses",
    external_id: "c8a09274e40974b62e285c9b44a50b12c3",
  },
  {
    name: "file-manager",
    path: "file-manager",
    external_id: "c9454dadf589752c0b08328bb495d3d6b1",
  },
  {
    name: "layout",
    path: "layout",
    external_id: "c8a0c6c1e989778fefa3dcfb187fc9ff53",
  },
  {
    name: "LMS",
    path: "LMS",
    external_id: "c8aa7fa2428925f841eadd8dd6668df1e9",
  },
  {
    name: "manjit",
    path: "manjit",
    external_id: "c91c1937780926fe9a75594781dd56f2f7",
  },
  {
    name: "number_reader",
    path: "number_reader",
    external_id: "c80ab66734891027ac03aa0f4196671e6f",
  },
  {
    name: "Products",
    path: "Products",
    external_id: "c78d2364ba095cf6b7051d87980e30b265",
  },
  {
    name: "samples",
    path: "samples",
    external_id: "c78d0a16628974954863fd2f623c9cf017",
  },
  {
    name: "Store",
    path: "Store",
    external_id: "c944d7a81e09759c25bf3832adfe46c786",
  },
  {
    name: "tsestayush",
    path: "tsestayush",
    external_id: "c91c5895de896a3a475d31142625dd5104",
  },
  {
    name: "tsetsoi",
    path: "tsetsoi",
    external_id: "c91c4aeabf0973d27f88bf0250d6cd6bfb",
  },
];

const getResourcesByExternalId = async (req, res) => {
  const { external_id } = req.query; // Get external_id from query parameters
  const sort_by = "uploaded_at";
  const max_results = 50;

  // Ensure external_id is provided
  if (!external_id) {
    return res
      .status(400)
      .json({ success: false, message: "external_id is required." });
  }

  // Find the folder corresponding to the provided external_id
  const folder = folders.find((f) => f.external_id === external_id);

  // If no folder found for the given external_id, return an error
  if (!folder) {
    return res
      .status(404)
      .json({
        success: false,
        message: "Folder not found for the provided external_id.",
      });
  }

  try {
    // Fetch resources from Cloudinary using the folder path as prefix
    const result = await cloudinary.api.resources({
      type: "upload", // Change to the resource type you're interested in
      prefix: folder.path, // Use the folder path as the prefix
      max_results: max_results,
      sort_by: sort_by,
    });

    res.status(200).json({
      success: true,
      resources: result.resources,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching resources",
      error: error.message || error,
    });
  }
};

module.exports = {
  searchResources,
  uploadFile,
  rootResources,
  deleteFile,
  deleteFolder,
  getRootFolders,
  getSubFolders,
  getFilesInFolder,
  createFolder,
  getResourcesByFolderPath,
  getResourcesByExternalId,
  getResourcesByPaginationFolderPath,
  renameFile,
};
