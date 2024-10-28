import React, { useState } from 'react'
import { renameFileById } from '../services/api';

const FileRenameModal = () => {
    const [newFileName, setNewFileName] = useState(""); // State for new file name
    const [renamingFileId, setRenamingFileId] = useState(null); // State for the file being renamed

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
      //  fetchFiles(); // Reload files after renaming
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
  return (
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
  )
}

export default FileRenameModal;