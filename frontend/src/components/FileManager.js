// frontend/src/components/FileManager.js

import React, { useEffect, useState } from 'react';
import { getRootFolders, getFilesInFolder } from '../services/api';
import FileList from './FileList';
import FileUpload from './FileUpload';

const FileManager = () => {
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
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

    return (
        <div className="flex">
            {/* Left sidebar for folders */}
            <div className="w-1/4 border-r p-4">
                <h2 className="font-bold text-lg mb-4">Folders</h2>
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
