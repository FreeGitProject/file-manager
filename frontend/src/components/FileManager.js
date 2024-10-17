import React, { useEffect, useState } from 'react';
import { getRootFolders, getSubFolders, getFilesInFolder, createFolder, deleteFolder } from '../services/api';
import FileList from './FileList';  // For the right section to show files
import FolderTree from './FolderTree';  // For the left tree view

const FileManager = () => {
    const [folders, setFolders] = useState([]);         // State for root folders
    const [files, setFiles] = useState([]);             // State for files
    const [selectedFolderPath, setSelectedFolderPath] = useState(null); // Currently selected folder path
    const [newFolderName, setNewFolderName] = useState('');   // New folder name for folder creation
    const [refresh, setRefresh] = useState(false);      // State to trigger folder refresh

    useEffect(() => {
        // Fetch root folders when component mounts or refresh is triggered
        const fetchRootFolders = async () => {
            try {
                const response = await getRootFolders();
                setFolders(response);  // Update root folders
            } catch (error) {
                console.error('Error fetching root folders:', error);
            }
        };

        fetchRootFolders();
    }, [refresh]);  // Rerun when refresh changes

    // Fetch files and subfolders in a selected folder
    const handleFolderClick = async (folderPath) => {
        try {
            const subFolderResponse = await getSubFolders(folderPath);
            const fileResponse = await getFilesInFolder(folderPath);
            
            setFiles(fileResponse);  // Populate the right section with files
            setFolders(subFolderResponse.subfolders);  // Update the folder structure with subfolders
            setSelectedFolderPath(folderPath);  // Set the currently selected folder path
        } catch (error) {
            console.error('Error fetching files or subfolders:', error);
        }
    };

    // Handle folder creation
    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName) return;

        try {
            // Create new folder using the current selected folder as the base
            await createFolder(`${selectedFolderPath ? selectedFolderPath + '/' : ''}${newFolderName}`);
            setNewFolderName('');   // Reset the new folder input
            setRefresh(!refresh);   // Trigger folder tree refresh
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    return (
        <div className="flex">
            {/* Left section: Folder Tree */}
            <div className="w-1/4 border-r p-4">
                <h2 className="font-bold text-lg mb-4">Folders</h2>
                <FolderTree folders={folders} onFolderClick={handleFolderClick} />

                {/* Folder creation form */}
                <form onSubmit={handleCreateFolder} className="mt-4">
                    <input
                        type="text"
                        placeholder="New folder name"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="w-full p-2 border rounded mb-2"
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
                        Create Folder
                    </button>
                </form>
            </div>

            {/* Right section: Files and Folders */}
            <div className="w-3/4 p-4">
                <h2 className="font-bold text-lg mb-4">Files in {selectedFolderPath || 'Root'}</h2>
                <FileList files={files} onFileDeleted={() => setRefresh(!refresh)} />
            </div>
        </div>
    );
};

export default FileManager;
