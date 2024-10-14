// frontend/src/components/FileItem.js

import React from 'react';

const FileItem = ({ file }) => {
    const { name, url, size, format } = file;

    // Convert file size to a human-readable format (KB or MB)
    const formatFileSize = (sizeInBytes) => {
        const sizeInKB = sizeInBytes / 1024;
        if (sizeInKB > 1024) {
            return (sizeInKB / 1024).toFixed(2) + ' MB';
        }
        return sizeInKB.toFixed(2) + ' KB';
    };

    return (
        <div className="file-item bg-white shadow-md rounded p-4 m-2 flex items-center">
            {/* Show image preview if the file is an image */}
            {format === 'jpg' || format === 'png' ? (
                <img
                    src={url}
                    alt={name}
                    className="w-16 h-16 object-cover mr-4 rounded"
                />
            ) : (
                <div className="w-16 h-16 bg-gray-300 text-center flex items-center justify-center rounded mr-4">
                    {/* Placeholder icon or file type */}
                    <span>{format.toUpperCase()}</span>
                </div>
            )}

            {/* File details */}
            <div className="file-info">
                <p className="file-name font-medium">{name}</p>
                <p className="file-size text-sm text-gray-500">
                    {formatFileSize(size)}
                </p>
            </div>
        </div>
    );
};

export default FileItem;
