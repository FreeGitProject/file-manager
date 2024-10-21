import {
  getResourcesByPaginationFolderPath,
  uploadImageToFolder,
  deleteFileByPublicId,
  rootResourcesWithPagination,
  searchResources,
  renameFileById,
  getFileDetailsByAssetId, // Import the API to get file details
} from "../services/api";
import FileDetailModal from "./FileDetailModal";
import { LoadingSpinner } from "./Loader/LoadingSpinner";
import RenameFileModal from "./RenameFileModal";
import React, { useState, useEffect } from "react";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";

const maxsize = 6;
let nextCursor = null;

const FileViewer = ({ selectedFolder }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // State for selected image file
  const [isUploading, setIsUploading] = useState(false); // Uploading state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // For search query
  const [renamingFileId, setRenamingFileId] = useState(null); // State for the file being renamed
  const [renamingFileName, setRenamingFileName] = useState(""); // Store file name to rename
  const [hasMoreFiles, setHasMoreFiles] = useState(true); // To check if there are more files to load
  const [showModal, setShowModal] = useState(false); // Modal state
  const [fileDetails, setFileDetails] = useState(null); // Store file details for modal

  // Fetch files with pagination
  const fetchFiles = async (append = false) => {
    console.log("!selectedFolder", selectedFolder);

    if (selectedFolder === "Home") {
      setIsLoading(true);
      // Fetch root files when no folder is selected (Home view)
      const { resources, next_cursor } = await rootResourcesWithPagination(
        maxsize,
        nextCursor
      );
      setFiles(append ? [...files, ...resources] : resources);
      nextCursor = next_cursor;
      setHasMoreFiles(!!next_cursor);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      try {
        const { resources, next_cursor } =
          await getResourcesByPaginationFolderPath(
            selectedFolder,
            maxsize, // Fetch 6 files per page
            nextCursor // Pass the current cursor for pagination
          );
        setFiles(append ? [...files, ...resources] : resources);
        nextCursor = next_cursor; // Update next cursor
        setHasMoreFiles(!!next_cursor); // Check if more files exist
      } catch (error) {
        console.error("Error fetching files:", error);
      }
      setIsLoading(false);
    }
  };
  useEffect(() => {
    nextCursor = null;
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
    setIsUploading(true); // Set uploading state to true
    const formData = new FormData();
    formData.append("image", selectedFile); // Append selected image file
    try {
      // Pass the folder as a query parameter in the URL
      const response = await uploadImageToFolder(formData, selectedFolder);
      if (response.success) {
        nextCursor = null;
        // Reload files after successful upload
        alert(response.message);
        console.log(selectedFolder, "selectedFolderupload");
        if (selectedFolder === "Home") {
          // Fetch root files when no folder is selected (Home view)
          const { resources } = await rootResourcesWithPagination(
            5,
            nextCursor
          );
          setFiles(resources);
        } else {
          const { resources } = await getResourcesByPaginationFolderPath(
            selectedFolder
          );
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

  // Handle renaming logic
  const handleRenameFile = async (fileId, newFileName) => {
    try {
      const response = await renameFileById(fileId, newFileName); // API call to rename file
      if (response.success) {
        alert("File renamed successfully");
        nextCursor = null;
        fetchFiles(); // Reload files after renaming
        setRenamingFileId(null); // Close rename modal
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
        <LoadingSpinner />
      ) : (
        <div>
          {/* Header Section */}
          <div className="flex flex-wrap-reverse items-center justify-between mb-6">
            <div className="w-full md:w-auto mb-4 md:mb-0">
              {/* File Upload Form */}
              <form
                onSubmit={handleFileUpload}
                className="flex items-center space-x-2"
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload Image"}
                </button>
              </form>
            </div>

            <div className="w-full md:w-auto mb-4 md:mb-0">
              {/* Search Form */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by filename or public ID"
                  className="border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition"
                >
                  Search
                </button>
              </form>
            </div>

            <div className="w-full md:w-auto">
              <h3 className="text-2xl font-bold text-gray-800">
                Files in {selectedFolder || "Home"}
              </h3>
            </div>
          </div>
          <br />
          {/* Files Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files?.length > 0 ? (
              files.map((file) => (
                <div
                  key={file.asset_id}
                  className="border rounded-lg shadow-lg p-5 flex flex-col items-center bg-white transition-transform transform hover:scale-105"
                >
                  {/* File Thumbnail or Icon */}
                  {file.format === "pdf" ? (
                    <div className="flex justify-center items-center h-40">
                      <FaFilePdf className="text-red-500 text-6xl mb-4" />
                    </div>
                  ) : file.format === "xlsx" || file.format === "xls" ? (
                    <div className="flex justify-center items-center h-40">
                      <FaFileExcel className="text-green-500 text-6xl mb-4" />
                    </div>
                  ) : (
                    <img
                      src={file.secure_url}
                      alt={file.public_id}
                      className="w-full h-40 object-cover rounded mb-4 shadow-md"
                    />
                  )}

                  {/* File Information */}
                  <h4 className="text-xl font-semibold mb-1 text-center truncate">
                    {file.public_id
                      ? file.public_id.split("/").pop().trim()
                      : "Unnamed File"}
                  </h4>
                  <p className="text-gray-500 text-sm text-center">
                    Folder: {file.folder}
                  </p>
                  <p className="text-gray-500 text-sm text-center">
                    Format: {file.format}
                  </p>

                  {/* Actions */}
                  <div className="mt-4 w-full space-y-2">
                    <button
                      onClick={() => {
                        setRenamingFileId(file.asset_id);
                        setRenamingFileName(
                          file.public_id.split("/").pop().trim()
                        );
                      }}
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-md transition"
                    >
                      Rename File
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.public_id)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md transition"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete File"}
                    </button>
                    <button
                      onClick={() => handleShowDetails(file.asset_id)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">
                No files found in this folder.
              </p>
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
      {/* Rename Modal */}
      {renamingFileId && (
        <RenameFileModal
          currentName={renamingFileName}
          fileId={renamingFileId}
          onRename={handleRenameFile}
          onClose={() => setRenamingFileId(null)} // Close modal
        />
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
