import React, { useState, useEffect } from 'react';
import { getResourcesByFolderPath } from '../services/api';

const FileViewer = ({ selectedFolder }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (selectedFolder) {
        const resources = await getResourcesByFolderPath(selectedFolder);
        setFiles(resources);
      }
    };
    fetchFiles();
  }, [selectedFolder]);

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">Files in {selectedFolder}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.length > 0 ? (
          files.map((file) => (
            <div key={file.asset_id} className="border rounded-lg shadow-md p-4">
              {/* Image Thumbnail */}
              <img
                src={file.secure_url}
                alt={file.public_id}
                className="w-full h-40 object-cover rounded mb-2" // Fixed height
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
