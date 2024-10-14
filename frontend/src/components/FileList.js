// frontend/src/components/FileList.js

import React, { useState } from 'react';
import { deleteFile } from '../services/api';
import Modal from './Modal';

const FileList = ({ files, onFileDeleted }) => {
    const [currentFile, setCurrentFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('asc');
    const [fileTypeFilter, setFileTypeFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const filesPerPage = 6;

    const formatFileSize = (sizeInBytes) => {
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (sizeInBytes === 0) return '0 Byte';
        const i = parseInt(Math.floor(Math.log(sizeInBytes) / Math.log(1024)), 10);
        return `${(sizeInBytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
    };

    const handleDelete = async (publicId) => {
        try {
            await deleteFile(publicId);
            onFileDeleted();
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    };

    const openModal = (file) => {
        setCurrentFile(file);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentFile(null);
    };

    // Sorting logic
    const sortedFiles = [...files].sort((a, b) => {
        if (sortOrder === 'asc') {
            return a.public_id.localeCompare(b.public_id);
        } else {
            return b.public_id.localeCompare(a.public_id);
        }
    });

    // Filtering logic
    const filteredFiles = sortedFiles.filter(file => {
        // File type filter
        const fileTypeMatch = fileTypeFilter === 'all' || 
            (fileTypeFilter === 'images' && file.url.match(/\.(jpeg|jpg|png|gif)$/i)) || 
            (fileTypeFilter === 'documents' && file.url.match(/\.(pdf|docx)$/i));

        // Search filter
        const searchMatch = file.public_id.toLowerCase().includes(searchQuery.toLowerCase());

        return fileTypeMatch && searchMatch; // Return files that match both filters
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
    const currentFiles = filteredFiles.slice((currentPage - 1) * filesPerPage, currentPage * filesPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleSortChange = (e) => {
        setSortOrder(e.target.value);
        setCurrentPage(1);
    };

    const handleFilterChange = (e) => {
        setFileTypeFilter(e.target.value);
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on search change
    };

    return (
        <div className="file-list-container">
            {/* Sort, Filter, and Search Section */}
            <div className="mb-4 flex justify-between">
                <select value={sortOrder} onChange={handleSortChange} className="border p-2 rounded">
                    <option value="asc">Sort by Name (A-Z)</option>
                    <option value="desc">Sort by Name (Z-A)</option>
                </select>
                <select value={fileTypeFilter} onChange={handleFilterChange} className="border p-2 rounded">
                    <option value="all">All Files</option>
                    <option value="images">Images</option>
                    <option value="documents">Documents</option>
                </select>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="border p-2 rounded"
                />
            </div>

            {/* File List */}
            <div className="grid grid-cols-3 gap-4">
                {currentFiles.map((file) => (
                    <div key={file.public_id} className="border p-4 rounded shadow-sm">
                        {/* Image preview or placeholder */}
                        {file.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                            <img
                                src={file.url}
                                alt={file.public_id}
                                className="w-full h-32 object-cover mb-2 cursor-pointer"
                                onClick={() => openModal(file)}
                            />
                        ) : (
                            <div
                                className="h-32 flex items-center justify-center bg-gray-100 text-gray-500 mb-2 cursor-pointer"
                                onClick={() => openModal(file)}
                            >
                                No Preview
                            </div>
                        )}
                        <div className="text-sm font-medium">{file.public_id}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>

                        {/* Delete button */}
                        <button
                            className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
                            onClick={() => handleDelete(file.public_id)}
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-4">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 mx-1 ${
                            currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        } rounded`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            {/* Modal for file details */}
            <Modal isOpen={isModalOpen} onClose={closeModal} file={currentFile} />
        </div>
    );
};

export default FileList;
