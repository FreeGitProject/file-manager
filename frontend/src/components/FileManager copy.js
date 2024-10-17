// frontend/src/components/FileManager.js

import React, { useEffect, useState } from 'react';
import { getRootFolders, getFilesInFolder, createFolder } from '../services/api';
import FileList from './FileList';
import FileUpload from './FileUpload';

const FileManager = () => {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [refresh, setRefresh] = useState(false);

    useEffect(() => {
        const fetchFolders = async () => {
            try {
                const response = await getRootFolders();
                setFolders(response);
            } catch (error) {
                console.error('Error fetching folders:', error);
            }
        };

        fetchFolders();
    }, [refresh]);

    const handleFolderClick = async (folderName) => {
        try {
            const response = await getFilesInFolder(folderName);
            setFiles(response);
            setSelectedFolder(folderName);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const handleFileUploaded = () => {
        setRefresh(!refresh); // Refresh folders after a file is uploaded
    };

    // Handle folder creation
    const handleCreateFolder = async (e) => {
        e.preventDefault();

        if (!newFolderName) return;

        try {
            await createFolder(newFolderName);
            setNewFolderName('');
            setRefresh(!refresh); // Refresh folders after creating a new one
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    return (
        <div className="flex">
            {/* Left sidebar for folders */}
            <div className="w-1/4 border-r p-4">
                <h2 className="font-bold text-lg mb-4">Folders</h2>
                
                {/* Folder creation form */}
                <form onSubmit={handleCreateFolder} className="mb-4">
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

                <ul>
                    {folders.map((folder) => (
                        <li
                            key={folder.public_id}
                            className="cursor-pointer mb-2 hover:bg-gray-200 p-2 rounded"
                            onClick={() => handleFolderClick(folder.folder_name)}
                        >
                            {folder.folder_name}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Right section for files and upload form */}
            <div className="w-3/4 p-4">
                <h2 className="font-bold text-lg mb-4">Files in {selectedFolder || 'Root'}</h2>
                <FileUpload onFileUploaded={handleFileUploaded} />
                <FileList files={files} onFileDeleted={handleFileUploaded} />
            </div>
        </div>
    );
};

export default FileManager;
