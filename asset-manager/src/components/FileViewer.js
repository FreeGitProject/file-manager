import React, { useState, useEffect } from "react";
import {
  getResourcesByFolderPath,
  getResourcesByPaginationFolderPath, // Function for fetching paginated resources
  uploadImageToFolder,
  deleteFileByPublicId,
  rootResources,
  rootResourcesWithPagination,
  searchResources,
  renameFileById, // Import your rename function here
  getFileDetailsByAssetId, // Import the API to get file details
} from "../services/api"; // Import rootResources API
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import FileDetailModal from "./FileDetailModal";
import { LoadingSpinner } from "./Loader/LoadingSpinner";
const maxsize=6;
const FileViewer = ({ selectedFolder }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // State for selected image file
  const [isUploading, setIsUploading] = useState(false); // Uploading state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // For search query
  const [newFileName, setNewFileName] = useState(""); // State for new file name
  const [renamingFileId, setRenamingFileId] = useState(null); // State for the file being renamed
  const [nextCursor, setNextCursor] = useState(null); // State to track pagination cursor
  const [hasMoreFiles, setHasMoreFiles] = useState(true); // To check if there are more files to load
  const [showModal, setShowModal] = useState(false); // Modal state
  const [fileDetails, setFileDetails] = useState(null); // Store file details for modal

  // Fetch files with pagination
  const fetchFiles = async (append = false) => {
    console.log("!selectedFolder", selectedFolder);
    if (selectedFolder === "Home") {
      setIsLoading(true);
      // Fetch root files when no folder is selected (Home view)
      const { resources, next_cursor } = await rootResourcesWithPagination(maxsize,nextCursor);
      setFiles(append ? [...files, ...resources] : resources);

      setIsLoading(false);
    } else {
      setIsLoading(true);
      try {
        const { resources, next_cursor } = await getResourcesByPaginationFolderPath(
          selectedFolder,
          maxsize, // Fetch 6 files per page
          nextCursor // Pass the current cursor for pagination
        );
        setFiles(append ? [...files, ...resources] : resources);
        setNextCursor(next_cursor); // Update next cursor
        setHasMoreFiles(!!next_cursor); // Check if more files exist
      } catch (error) {
        console.error("Error fetching files:", error);
      }
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

    // Load more files (next page)
    const loadMoreFiles = async () => {
      if (hasMoreFiles) {
        await fetchFiles(true);
      }
    };
  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle form submission to upload image
  const handleFileUpload = async (e) => {
    e.preventDefault();
    //console.log("!selectedFolder1", selectedFolder);
    if (!selectedFile || !selectedFolder) {
      alert("Please select a file and folder.");
      return;
    }
    //here set selectedFolder root directory folder ""
    // if (selectedFolder === "Home") selectedFolder = "";

    setIsUploading(true); // Set uploading state to true
    const formData = new FormData();
    formData.append("image", selectedFile); // Append selected image file
    // formData.append("folder", selectedFolder); // Append folder name

    try {
      // Pass the folder as a query parameter in the URL
      const response = await uploadImageToFolder(formData, selectedFolder);
      if (response.success) {
        // Reload files after successful upload
        alert(response.message);
        console.log(selectedFolder, "selectedFolderupload");
        if (selectedFolder === "Home") {
          // Fetch root files when no folder is selected (Home view)
          const { resources} = await rootResourcesWithPagination(5,nextCursor);
          setFiles(resources);
        } else {
          const { resources}= await getResourcesByPaginationFolderPath(selectedFolder);
          setFiles(resources);
        }
        setSelectedFile(null); // Reset selected file
      } else {
        alert("File upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false); // Reset uploading state
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (publicId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (confirmDelete) {
      setIsDeleting(true);
      try {
        const response = await deleteFileByPublicId(publicId);
        if (response.success) {
          // Remove the deleted file from the list
          setFiles(files.filter((file) => file.public_id !== publicId));
        } else {
          alert("Error deleting file");
        }
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("An error occurred while deleting the file.");
      } finally {
        setIsDeleting(false);
      }
    }
  };
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle search form submission
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        // if (selectedFolder === "Home") selectedFolder = "";
        const results = await searchResources(searchQuery, selectedFolder);

        // console.log(results)
        setFiles(results);
      } catch (error) {
        console.error("Error searching files:", error);
      }
    } else {
      await fetchFiles();
    }
  };
// Handle file renaming
const handleRenameFile = async (fileId) => {
  if (!newFileName) {
    alert("Please enter a new file name.");
    return;
  }

  try {
    const response = await renameFileById(fileId, newFileName); // API call to rename file
    if (response.success) {
      alert("File renamed successfully");
      fetchFiles(); // Reload files after renaming
      setNewFileName(""); // Clear the input field
      setRenamingFileId(null); // Clear renaming state
    } else {
      alert("Error renaming file");
    }
  } catch (error) {
    console.error("Error renaming file:", error);
    alert("An error occurred while renaming the file.");
  }
};
 // Handle showing the modal with file details
 const handleShowDetails = async (assetId) => {
  try {
    const details = await getFileDetailsByAssetId(assetId); // Fetch file details by asset_id
    setFileDetails(details.data); // Store the details for the modal
    setShowModal(true); // Show the modal
  } catch (error) {
    console.error("Error fetching file details:", error);
  }
};
  return (
    <div>
      {isLoading ? (
        // <p>Loading files...</p>
        <LoadingSpinner/>
      ) : (
        <div>
          <h3 className="text-2xl font-bold mb-4">
            Files in {selectedFolder || "Home"}
          </h3>

          {/* File Upload Form */}
          <form onSubmit={handleFileUpload} className="mb-4">
            <input
              type="file"
              onChange={handleFileChange}
              className="border p-2 rounded mr-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Image"}
            </button>
          </form>
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by filename or public ID"
              className="border p-2 rounded mr-2"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded"
            >
              Search
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files?.length > 0 ? (
              files.map((file) => (
                <div
                  key={file.asset_id}
                  className="border rounded-lg shadow-md p-4 flex flex-col items-center"
                >
                  {/* File Thumbnail or Icon */}
                  {file.format === "pdf" ? (
                    <div className="flex justify-center items-center h-40">
                      <FaFilePdf className="text-red-500 text-6xl mb-2" />
                    </div>
                  ) : file.format === "xlsx" || file.format === "xls" ? (
                    <div className="flex justify-center items-center h-40">
                      <FaFileExcel className="text-green-500 text-6xl mb-2" />
                    </div>
                  ) : (
                    <img
                      src={file.secure_url}
                      alt={file.public_id}
                      className="w-full h-40 object-cover rounded mb-2"
                    />
                  )}

                  <h4 className="text-xl font-semibold mb-2 text-center">
                    {file.public_id
                      ? file.public_id.split("/").pop().trim()
                      : "Unnamed File"}
                  </h4>
                  <p className="text-gray-600 text-center">
                    Size: {Math.round(file.bytes / 1024)} KB
                  </p>
                  <p className="text-gray-600 text-center">
                    Folder: {file.folder}
                  </p>
                  <p className="text-gray-600 text-center">
                    Format: {file.format}
                  </p>
                  <a
                    href={file.secure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 block text-center"
                  >
                    View File
                  </a>
                  <button
                    onClick={() => {
                      setRenamingFileId(file.asset_id); // Set the file ID to be renamed
                      setNewFileName(file.public_id.split("/").pop().trim()); // Set current name for editing
                    }}
                    className="bg-yellow-500 text-white p-2 rounded mt-2"
                  >
                    Rename File
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.public_id)}
                    className="bg-red-500 text-white p-2 rounded mt-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete File"}
                  </button>
                  <button
                    onClick={() => handleShowDetails(file.asset_id)} // Show file details in modal
                    className="bg-blue-500 text-white p-2 rounded mt-2"
                  >
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No files found in this folder.</p>
            )}
          </div>
         {/* Pagination Control */}
         {hasMoreFiles && (
            <div className="mt-4 text-center">
              <button
                onClick={loadMoreFiles}
                className="bg-blue-500 text-white p-2 rounded"
              >
                {isLoading ? "Loading more..." : "Load More Files"}
              </button>
            </div>
          )}
        </div>
      )}
         {/* Renaming Input */}
         {renamingFileId && (
            <div className="mt-4">
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
                className="border p-2 rounded mr-2"
              />
              <button
                onClick={() => handleRenameFile(renamingFileId)}
                className="bg-blue-500 text-white p-2 rounded"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setRenamingFileId(null); // Cancel renaming
                  setNewFileName(""); // Clear input
                }}
                className="bg-gray-300 text-black p-2 rounded ml-2"
              >
                Cancel
              </button>
            </div>
          )}

           {/* Modal to show file details */}
           {showModal && fileDetails && (
            <FileDetailModal
              fileDetails={fileDetails}
              onClose={() => setShowModal(false)}
            />
          )}
    </div>
  );
};

export default FileViewer;
