import {
  getRootFolders,
  getSubFolders,
  createFolder,
  deleteFolder,
} from "../services/api";
import { Button, Input } from "@headlessui/react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderPlus,
  FolderMinus,
} from "lucide-react";
import React, { useState, useEffect } from "react";

const maxResults = 10; // Optional: specify max results
const nextCursor = ""; // Optional: specify the next cursor for pagination

const FolderTree = ({ onSelectFolder }) => {
  const [folders, setFolders] = useState([]); // Store root folders
  const [expandedFolders, setExpandedFolders] = useState({}); // Store expanded state of folders
  const [newFolderName, setNewFolderName] = useState(""); // Store new folder name for creation
  const [folderToDelete, setFolderToDelete] = useState(""); // Store folder to delete
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isHomeExpanded, setIsHomeExpanded] = useState(false); // Track if "Home" is expanded

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);

  // Fetch root folders when "Home" is clicked
  const fetchRootFolders = async () => {
    setIsLoading(true);
    const rootFolders = await getRootFolders();
    setFolders(rootFolders);
    setIsLoading(false);
  };

  const toggleFolder = async (folderPath) => {
    if (!expandedFolders[folderPath]) {
      const subFolders = await getSubFolders(folderPath, maxResults, nextCursor);
      setExpandedFolders({ ...expandedFolders, [folderPath]: subFolders });
    } else {
      setExpandedFolders({ ...expandedFolders, [folderPath]: null });
    }
    // Call onSelectFolder when a folder is clicked
    onSelectFolder(folderPath);
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      await createFolder(newFolderName);
      setNewFolderName("");
      // Refresh the folder list
      await fetchRootFolders();
    }
  };

  const handleDeleteFolder = async () => {
    if (folderToDelete) {
      await deleteFolder(folderToDelete);
      setFolderToDelete("");
      // Refresh the folder list
      await fetchRootFolders();
    }
  };

  const toggleHome = async () => {
    if (!isHomeExpanded) {
      await fetchRootFolders(); // Fetch folders when expanding Home
    }
    setIsHomeExpanded(!isHomeExpanded); // Toggle Home expanded state
    // Call onSelectFolder with "Home" as the selected folder
    onSelectFolder("Home");
  };

  const renderFolders = (folderList) =>
    folderList.map((folder) => (
      <div key={folder.path} className="ml-4">
        <span
          className="flex items-center cursor-pointer hover:text-blue-500"
          onClick={() => toggleFolder(folder.path)}
        >
          <Folder className="mr-2 h-5 w-5" /> {/* Folder icon */}
          {expandedFolders[folder.path] ? (
            <ChevronDown className="mr-2 h-4 w-4" />
          ) : (
            <ChevronRight className="mr-2 h-4 w-4" />
          )}
          {folder.name}
        </span>
        {expandedFolders[folder.path] && (
          <div>{renderFolders(expandedFolders[folder.path])}</div>
        )}
      </div>
    ));

  return (
    <div className="p-4  ">
      {/* Home root button with toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <div className="flex space-x-2">
          <Button
            className="inline-flex items-center gap-2 rounded-md bg-green-600 py-1.5 px-3 text-sm font-semibold text-white hover:bg-green-700 transition"
            onClick={() => setIsNewFolderModalOpen(true)}
          >
            <FolderPlus className="h-4 w-4" />
            New
          </Button>
          <Button
            className="inline-flex items-center gap-2 rounded-md bg-red-600 py-1.5 px-3 text-sm font-semibold text-white hover:bg-red-700 transition"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <FolderMinus className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div
        className="flex items-center cursor-pointer hover:text-blue-500"
        onClick={toggleHome}
      >
        <Folder className="mr-2 h-5 w-5" /> {/* Folder icon */}
        {isHomeExpanded ? (
          <ChevronDown className="mr-2 h-4 w-4" />
        ) : (
          <ChevronRight className="mr-2 h-4 w-4" />
        )}
        Home {/* Toggle icon */}
      </div>

      {/* Show Loading Folders... under Home if loading */}
      {isHomeExpanded && isLoading && (
        <p className="ml-4">Loading Folders...</p>
      )}

      {/* Render folders only if "Home" is expanded and not loading */}
      {isHomeExpanded && !isLoading && renderFolders(folders)}

      {/* Create Folder Form */}
      <Dialog
        open={isNewFolderModalOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={setIsNewFolderModalOpen}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black bg-opacity-30">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <DialogTitle as="h3" className="text-lg font-medium">
                Create New Folder
              </DialogTitle>
              <div className="py-4">
                <Input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter new folder name"
                  className="border p-2 rounded mr-2 w-full"
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                  onClick={handleCreateFolder}
                >
                  Create
                </Button>
                <Button
                  className="ml-2 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
                  onClick={() => setIsNewFolderModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        as="div"
        className="relative z-10 focus:outline-none"
        onClose={setIsDeleteDialogOpen}
      >
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-black bg-opacity-30">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <DialogTitle as="h3" className="text-lg font-medium">
                Delete Folder
              </DialogTitle>
              <div className="py-4">
                <Input
                  type="text"
                  value={folderToDelete}
                  onChange={(e) => setFolderToDelete(e.target.value)}
                  placeholder="Enter folder path to delete"
                  className="border p-2 rounded mr-2 w-full"
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
                  onClick={handleDeleteFolder}
                >
                  Delete
                </Button>
                <Button
                  className="ml-2 bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400 transition"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default FolderTree;
