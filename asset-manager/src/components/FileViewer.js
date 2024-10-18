import React, { useState, useEffect } from "react";
import {
  getResourcesByFolderPath,
  uploadImageToFolder,
  deleteFileByPublicId,
  rootResources,
  searchResources,
} from "../services/api"; // Import rootResources API

const FileViewer = ({ selectedFolder }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // State for selected image file
  const [isUploading, setIsUploading] = useState(false); // Uploading state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // For search query
  const fetchFiles = async () => {
    // console.log("!selectedFolder", selectedFolder);
    if (selectedFolder === "Home") {
      setIsLoading(true);
      // Fetch root files when no folder is selected (Home view)
      const resources = await rootResources();
      setFiles(resources);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      const resources = await getResourcesByFolderPath(selectedFolder);
      setFiles(resources);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

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
    formData.append("folder", selectedFolder); // Append folder name

    try {
      const response = await uploadImageToFolder(formData);
      if (response.success) {
        // Reload files after successful upload
        alert(response.message);
        console.log(selectedFolder,"selectedFolderupload")
        if (selectedFolder === "Home")
          {
              // Fetch root files when no folder is selected (Home view)
          const resources = await rootResources();
        }else{

          const resources = await getResourcesByFolderPath(selectedFolder);
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
        if (selectedFolder === "Home") selectedFolder = "";
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
  //return (<div>ss</div>)
  return (
    <div>
      {isLoading ? (
        <p>Loading files...</p>
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
                  className="border rounded-lg shadow-md p-4"
                >
                  {/* Image Thumbnail */}
                  <img
                    src={file.secure_url}
                    alt={file.public_id}
                    className="w-full h-40 object-cover rounded mb-2"
                  />
                  <h4 className="text-xl font-semibold mb-2">
                    {file.public_id
                      ? file.public_id.split("/").pop().trim()
                      : "Unnamed File"}
                  </h4>
                  <p className="text-gray-600">
                    Size: {Math.round(file.bytes / 1024)} KB
                  </p>
                  <p className="text-gray-600">Folder: {file.folder}</p>
                  <p className="text-gray-600">Format: {file.format}</p>
                  <a
                    href={file.secure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline mt-2 block"
                  >
                    View File
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.public_id)}
                    className="bg-red-500 text-white p-2 rounded mt-2"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete File"}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No files found in this folder.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileViewer;
