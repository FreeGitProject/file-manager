import React, { useState } from 'react';
import { getSubFolders } from '../services/api';

const FolderTree = ({ folders, onFolderClick }) => {
    const [expandedFolders, setExpandedFolders] = useState({});

    const toggleFolder = async (folderPath) => {
        const isExpanded = expandedFolders[folderPath];
        setExpandedFolders({ ...expandedFolders, [folderPath]: !isExpanded });

        if (!isExpanded && !folders[folderPath]?.subfolders) {
            try {
                const subfolders = await getSubFolders(folderPath);
                folders[folderPath].subfolders = subfolders;
            } catch (error) {
                console.error('Error fetching subfolders:', error);
            }
        }
    };

    const renderFolder = (folder) => {
        const isExpanded = expandedFolders[folder.path];
        return (
            <li key={folder.path} className="mb-2">
                <div onClick={() => { toggleFolder(folder.path); onFolderClick(folder.path); }} className="cursor-pointer">
                    <i className={`fa ${isExpanded ? 'fa-folder-open' : 'fa-folder'}`}></i> {folder.name}
                </div>
                {isExpanded && folder.subfolders && (
                    <ul className="ml-4">
                        {folder.subfolders.map((subfolder) => renderFolder(subfolder))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <ul>
            {folders.map((folder) => renderFolder(folder))}
        </ul>
    );
};

export default FolderTree;
