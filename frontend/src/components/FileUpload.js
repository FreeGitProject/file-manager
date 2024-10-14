// frontend/src/components/FileUpload.js

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '../services/api';

const FileUpload = ({ onFileUploaded }) => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress

    // Function for handling traditional file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Function for handling file upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        try {
            const response = await uploadFile(file, (progressEvent) => {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentage); // Update upload progress
            });
            onFileUploaded(response.fileUrl); // Notify parent about the uploaded file
            setFile(null); // Reset file input
            setUploadProgress(0); // Reset progress
        } catch (error) {
            console.error('File upload failed:', error);
        }
    };

    // React Dropzone logic for drag-and-drop file uploading
    const onDrop = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0]; // Handle only one file at a time for simplicity
        setFile(selectedFile);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="file-upload-container">
            {/* Drag-and-drop area */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed p-6 text-center rounded ${
                    isDragActive ? 'border-blue-500' : 'border-gray-400'
                }`}
            >
                <input {...getInputProps()} accept=".jpg,.png,.pdf,.docx" />
                {isDragActive ? (
                    <p>Drop the file here...</p>
                ) : (
                    <p>Drag & drop some files here, or click to select files</p>
                )}
            </div>

            {/* Traditional file input */}
            <form onSubmit={handleUpload} className="mt-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".jpg,.png,.pdf,.docx"
                    className="mb-2"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Upload
                </button>
            </form>

            {/* Upload progress indicator */}
            {uploadProgress > 0 && (
                <div className="mt-2">
                    <progress value={uploadProgress} max="100" />
                    <span>{uploadProgress}%</span>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
