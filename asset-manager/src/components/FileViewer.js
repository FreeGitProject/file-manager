import React, { useState, useEffect } from 'react';
import { getResourcesByFolderPath, uploadImageToFolder } from '../services/api'; // Import the new uploadImageToFolder API

const FileViewer = ({ selectedFolder }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // State for selected image file
  const [isUploading, setIsUploading] = useState(false); // Uploading state

  useEffect(() => {
    const fetchFiles = async () => {
      if (selectedFolder) {
        const resources = await getResourcesByFolderPath(selectedFolder);
        setFiles(resources);
      }
    };
    fetchFiles();
  }, [selectedFolder]);

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle form submission to upload image
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !selectedFolder) {
      alert('Please select a file and folder.');
      return;
    }

    setIsUploading(true); // Set uploading state to true
    const formData = new FormData();
    formData.append('image', selectedFile); // Append selected image file
    formData.append('folder', selectedFolder); // Append folder name

    try {
      const response = await uploadImageToFolder(formData);
      if (response.success) {
        // Reload files after successful upload
        alert(response.message);
        const resources = await getResourcesByFolderPath(selectedFolder);
        setFiles(resources);
        setSelectedFile(null); // Reset selected file
      } else {
        alert('File upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred while uploading the file.');
    } finally {
      setIsUploading(false); // Reset uploading state
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Files in {selectedFolder}</h3>

      {/* File Upload Form */}
      <form onSubmit={handleFileUpload} className="mb-4">
        <input type="file" onChange={handleFileChange} className="border p-2 rounded mr-2" />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.asset_id} className="border rounded-lg shadow-md p-4">
              {/* Image Thumbnail */}
              <img
                src={file.secure_url}
                alt={file.public_id}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h4 className="text-xl font-semibold mb-2">{file.public_id}</h4>
              <p className="text-gray-600">Size: {Math.round(file.bytes / 1024)} KB</p>
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
            </div>
          ))
        ) : (
          <p className="text-gray-600">No files found in this folder.</p>
        )}
      </div>
    </div>
  );
};

export default FileViewer;
