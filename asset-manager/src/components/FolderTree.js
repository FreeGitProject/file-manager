import React, { useState, useEffect } from 'react';
import { getRootFolders, getSubFolders } from '../services/api';
import { FaFolder } from 'react-icons/fa'; // Importing folder icon
const maxResults = 10; // Optional: specify max results
const nextCursor = ""; // Optional: specify the next cursor for pagination
const FolderTree = ({ onSelectFolder }) => {
  const [folders, setFolders] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    const fetchFolders = async () => {
      const rootFolders = await getRootFolders();
      setFolders(rootFolders);
    };
    fetchFolders();
  }, []);

  const toggleFolder = async (folderPath) => {
    if (!expandedFolders[folderPath]) {
      const subFolders =  await getSubFolders(folderPath, maxResults, nextCursor);
      setExpandedFolders({ ...expandedFolders, [folderPath]: subFolders });
    } else {
      setExpandedFolders({ ...expandedFolders, [folderPath]: null });
    }
    
    // Call onSelectFolder when a folder is clicked
    onSelectFolder(folderPath);
  };
  //If you want to call onSelectFolder only when expanding the folder, you can modify the toggleFolder function:
//   const toggleFolder = async (folderPath) => {
//     if (!expandedFolders[folderPath]) {
//       const subFolders = await getSubFolders(folderPath);
//       setExpandedFolders({ ...expandedFolders, [folderPath]: subFolders });
      
//       // Call onSelectFolder when a folder is expanded
//       onSelectFolder(folderPath);
//     } else {
//       setExpandedFolders({ ...expandedFolders, [folderPath]: null });
//     }
// };

  const renderFolders = (folderList, parentPath = '') => (
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
      <h3 className="text-lg font-bold mb-2">Folder Structure</h3>
      <div>{renderFolders(folders)}</div>
    </div>
  );
};

export default FolderTree;
