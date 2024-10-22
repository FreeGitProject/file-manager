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
import { MoreVertical } from "lucide-react";
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // For search query
  const [renamingFileId, setRenamingFileId] = useState(null); // State for the file being renamed
  const [renamingFileName, setRenamingFileName] = useState(""); // Store file name to rename
  const [hasMoreFiles, setHasMoreFiles] = useState(false); // To check if there are more files to load
  const [showModal, setShowModal] = useState(false); // Modal state
  const [fileDetails, setFileDetails] = useState(null); // Store file details for modal
  const [dropdownOpen, setDropdownOpen] = useState(null); // State for toggling dropdown per file

  // Modify the fetchFiles function to use isLoading more clearly
  const fetchFiles = async (append = false) => {
    // Only set loading state if it's the initial fetch
    if (!append) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true); // Only if appending
    }

    try {
      if (selectedFolder === "Home") {
        const { resources, next_cursor } = await rootResourcesWithPagination(
          maxsize,
          nextCursor
        );
        setFiles(append ? [...files, ...resources] : resources);
        nextCursor = next_cursor;
        setHasMoreFiles(!!next_cursor);
      } else {
        const { resources, next_cursor } =
          await getResourcesByPaginationFolderPath(
            selectedFolder,
            maxsize,
            nextCursor
          );
        setFiles(append ? [...files, ...resources] : resources);
        nextCursor = next_cursor;
        setHasMoreFiles(!!next_cursor);
        console.log(hasMoreFiles, "next_cursor", next_cursor);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      // Only reset loading state if you were loading more
      if (!append) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };
  useEffect(() => {
    nextCursor = null;
    fetchFiles();
  }, [selectedFolder]);

  // Load more files (next page)
  const loadMoreFiles = async () => {
    if (hasMoreFiles) {
      //  setIsLoadingMore(true); // Set loading more state to true
      await fetchFiles(true); // Fetch more files
      //  setIsLoadingMore(false); // Reset loading more state
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
  const toggleDropdown = (assetId) => {
    setDropdownOpen(dropdownOpen === assetId ? null : assetId); // Toggle dropdown for each file
  };
  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex flex-wrap-reverse items-center justify-between mb-6 sticky top-0 bg-white border-b">
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

      {/* Files Section */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <LoadingSpinner /> // Show spinner while loading files
        ) : files?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
              <div
                key={file.asset_id}
                className="border rounded-lg shadow-lg p-5 flex flex-col items-center bg-white transition-transform transform hover:scale-105 relative"
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

                <div className="w-full">
                  {/* File Name */}
                  <h4 className="text-xl font-semibold text-start mb-2">
                    {file.public_id
                      ? file.public_id.split("/").pop().trim()
                      : "Unnamed File"}
                  </h4>

                  {/* Folder and Format on the same line, justified between */}
                  <div className="flex justify-between text-sm text-gray-500">
                    <p>{file.folder || "No Folder"}</p>
                    <p>{file.format}</p>
                  </div>
                </div>

                {/* MoreVertical Icon and Dropdown */}
                <div className="absolute top-2 right-2">
                  <MoreVertical
                    className="h-6 w-6 cursor-pointer"
                    onClick={() => toggleDropdown(file.asset_id)}
                  />
                  {dropdownOpen === file.asset_id && (
                    <div className="absolute top-8 right-0 w-32 bg-white border rounded shadow-lg z-10">
                      <ul>
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setRenamingFileId(file.asset_id);
                            setRenamingFileName(
                              file.public_id.split("/").pop().trim()
                            );
                            setDropdownOpen(null); // Close dropdown
                          }}
                        >
                          Rename
                        </li>
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            handleShowDetails(file.asset_id);
                            setDropdownOpen(null); // Close dropdown
                          }}
                        >
                          View Details
                        </li>
                        <li
                          className="p-2 hover:bg-gray-100 cursor-pointer text-red-500"
                          onClick={() => {
                            handleDeleteFile(file.public_id);
                            setDropdownOpen(null); // Close dropdown
                          }}
                        >
                          Delete
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-500 text-center">
              No files found in this folder.
            </p>
          </div>
        )}

        {/* Pagination Control */}
        {hasMoreFiles && (
          <div className="mt-4 text-center">
            <button
              onClick={loadMoreFiles}
              className={`${isLoadingMore ? '':'bg-blue-500'} text-white p-2 rounded`}
              disabled={isLoadingMore} // Disable button when loading more
            >
              {isLoadingMore ? <LoadingSpinner /> : "Load More Files"}
            </button>
          </div>
        )}
      </div>

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
