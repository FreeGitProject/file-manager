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
      <h3 className="text-lg font-bold mb-2">Files in {selectedFolder}</h3>
      <ul className="list-disc pl-5">
        {files.length > 0 ? (
          files.map((file) => (
            <li key={file.asset_id}>
              <a href={file.secure_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {file.public_id} ({file.format})
              </a>
            </li>
          ))
        ) : (
          <p>No files found in this folder.</p>
        )}
      </ul>
    </div>
  );
};

export default FileViewer;
