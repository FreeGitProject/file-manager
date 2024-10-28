import React, { useState } from "react";

const RenameFileModal = ({ currentName, fileId, onRename, onClose }) => {
  const [newFileName, setNewFileName] = useState(currentName);

  const handleRename = () => {
    if (newFileName.trim()) {
      onRename(fileId, newFileName); // Trigger rename logic passed as prop
    } else {
      alert("Please enter a valid file name.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2">Rename File</h3>
        <input
          type="text"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="Enter new file name"
          className="border p-2 rounded mb-4 w-full"
        />
        <div className="flex justify-end">
          <button
            onClick={handleRename}
            className="bg-blue-500 text-white p-2 rounded mr-2"
          >
            Rename
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-black p-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameFileModal;
