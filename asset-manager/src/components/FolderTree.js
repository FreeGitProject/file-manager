import React, { useState, useEffect } from 'react';
import { getRootFolders, getSubFolders, createFolder, deleteFolder } from '../services/api';
import { FaFolder } from 'react-icons/fa'; // Importing folder icon

const maxResults = 10; // Optional: specify max results
const nextCursor = ""; // Optional: specify the next cursor for pagination

const FolderTree = ({ onSelectFolder }) => {
  const [folders, setFolders] = useState([]); // Store root folders
  const [expandedFolders, setExpandedFolders] = useState({}); // Store expanded state of folders
  const [newFolderName, setNewFolderName] = useState(''); // Store new folder name for creation
  const [folderToDelete, setFolderToDelete] = useState(''); // Store folder to delete
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isHomeExpanded, setIsHomeExpanded] = useState(false); // Track if "Home" is expanded

  // Fetch root folders when "Home" is clicked
  const fetchRootFolders = async () => {
    setIsLoading(true);
    const rootFolders = await getRootFolders();
    setFolders(rootFolders);
    setIsLoading(false);
  };

  const toggleFolder = async (folderPath) => {
    if (!expandedFolders[folderPath]) {
      const subFolders = await getSubFolders(folderPath, maxResults, nextCursor);
      setExpandedFolders({ ...expandedFolders, [folderPath]: subFolders });
    } else {
      setExpandedFolders({ ...expandedFolders, [folderPath]: null });
    }

    // Call onSelectFolder when a folder is clicked
    onSelectFolder(folderPath);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await createFolder(newFolderName);
      setNewFolderName('');
      // Optionally refresh the folder list or fetch subfolders to reflect the new folder
      const rootFolders = await getRootFolders();
      setFolders(rootFolders);
    }
  };

  const handleDeleteFolder = async () => {
    if (folderToDelete) {
      await deleteFolder(folderToDelete);
      setFolderToDelete('');
      // Optionally refresh the folder list
      const rootFolders = await getRootFolders();
      setFolders(rootFolders);
    }
  };

  const toggleHome = async () => {
    
    if (!isHomeExpanded) {
      await fetchRootFolders(); // Fetch folders when expanding Home
    }
    setIsHomeExpanded(!isHomeExpanded); // Toggle Home expanded state
    // Call onSelectFolder with "Home" as the selected folder
    onSelectFolder('Home');
  };

  const renderFolders = (folderList) => (
    folderList.map(folder => (
      <div key={folder.path} className="ml-4">
        <span className="flex items-center cursor-pointer" onClick={() => toggleFolder(folder.path)}>
          <FaFolder className="mr-2" /> {/* Folder icon */}
          {expandedFolders[folder.path] ? '-' : '+'} {folder.name}
        </span>
        {expandedFolders[folder.path] && (
          <div>
            {renderFolders(expandedFolders[folder.path])}
          </div>
        )}
      </div>
    ))
  );

  return (
    <div>
      {/* Home root button with toggle */}
      <h3 className="text-lg font-bold mb-2">Folder Structure</h3>
      <div className="flex items-center cursor-pointer" onClick={toggleHome}>
        <FaFolder className="mr-2" /> {/* Folder icon */}
        {isHomeExpanded ? '-' : '+'} Home {/* Toggle icon */}
      </div>

      {/* Show Loading Folders... under Home if loading */}
      {isHomeExpanded && isLoading && <p className="ml-4">Loading Folders...</p>}

      {/* Render folders only if "Home" is expanded and not loading */}
      {isHomeExpanded && !isLoading && renderFolders(folders)}

      {/* Create Folder Form */}
      <form onSubmit={handleCreateFolder} className="mt-4">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Enter new folder name"
          className="border p-2 rounded mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Folder
        </button>
      </form>

      {/* Delete Folder Form */}
      <div className="mt-4">
        <h4 className="text-lg font-bold">Delete Folder</h4>
        <input
          type="text"
          value={folderToDelete}
          onChange={(e) => setFolderToDelete(e.target.value)}
          placeholder="Enter folder path to delete"
          className="border p-2 rounded mr-2"
        />
        <button onClick={handleDeleteFolder} className="bg-red-500 text-white p-2 rounded">
          Delete Folder
        </button>
      </div>
    </div>
  );
};

export default FolderTree;
