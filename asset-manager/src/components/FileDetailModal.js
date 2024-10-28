import React from "react";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
const FileDetailModal = ({ fileDetails, onClose }) => {
  const { public_id, format, bytes, folder, secure_url, width, height } =
    fileDetails || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {/* File Thumbnail or Icon */}
        {format === "pdf" ? (
          <div className="flex justify-center items-center h-40">
            <FaFilePdf className="text-red-500 text-6xl mb-2" />
          </div>
        ) : format === "xlsx" || format === "xls" ? (
          <div className="flex justify-center items-center h-40">
            <FaFileExcel className="text-green-500 text-6xl mb-2" />
          </div>
        ) : (
          <img
            src={secure_url}
            alt={public_id}
            className="w-full h-40 object-cover rounded mb-2"
          />
        )}
        <h3 className="text-xl font-bold mb-4">File Details</h3>
        <p>
          <strong>Filename:</strong> {public_id?.split("/").pop()}
        </p>
        <p>
          <strong>Size:</strong> {Math.round(bytes / 1024)} KB
        </p>
        <p>
          <strong>Folder:</strong> {folder}
        </p>
        <p>
          <strong>Format:</strong> {format}
        </p>
        <p>
          <strong>Dimensions:</strong> {width}x{height} px
        </p>
        <a
          href={secure_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline block mt-2"
        >
          View File
        </a>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FileDetailModal;
