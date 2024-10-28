import React, { useState, useEffect } from "react";
import FolderTree from "./FolderTree";
import FileViewer from "./FileViewer";

const AssetManager = () => {
  const [selectedFolder, setSelectedFolder] = useState("Home"); //bydefault set home

  const handleFolderSelect = (folderPath) => {
    console.log("AssetManager Selected Folder:", folderPath);
    setSelectedFolder(folderPath);
  };

  useEffect(() => {
    console.log("Updated Selected Folder:", selectedFolder);
  }, [selectedFolder]);

  return (
    <div className="flex h-screen bg-background">
      <div className="w-1/4 border-r p-4">
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
