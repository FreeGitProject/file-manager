import React, { useState, useEffect } from "react";
import FolderTree from "./FolderTree";
import FileViewer from "./FileViewer";

const AssetManager = () => {
  const [selectedFolder, setSelectedFolder] = useState("Home");//bydefault set home

  const handleFolderSelect = (folderPath) => {
    console.log('Selected Folder:', folderPath);
    setSelectedFolder(folderPath);
  }; 

  useEffect(() => {
    console.log('Updated Selected Folder:', selectedFolder);
  }, [selectedFolder]);

  return (
    <div className="flex">
      <div className="w-1/3 p-4 border-r">
        <FolderTree onSelectFolder={handleFolderSelect} />
      </div>
      <div className="w-2/3 p-4">
      <FileViewer selectedFolder={selectedFolder} />
        {/* {selectedFolder ? (
          <FileViewer selectedFolder={selectedFolder} />
        ) : (
          <div>Please select a folder from the left to view its contents</div>
        )} */}
      </div>
    </div>
  );
};

export default AssetManager;
