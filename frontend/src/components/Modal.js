// frontend/src/components/Modal.js

import React from 'react';

const Modal = ({ isOpen, onClose, file }) => {
    if (!isOpen || !file) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md w-3/4 max-w-lg">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-500">X</button>
                <h2 className="text-lg font-bold mb-2">{file.public_id}</h2>
                {file.url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                    <img src={file.url} alt={file.public_id} className="w-full h-48 object-cover mb-2" />
                ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-100 text-gray-500 mb-2">
                        No Preview Available
                    </div>
                )}
                <p className="text-sm">Size: {(file.size / 1024).toFixed(2)} KB</p>
                <p className="text-sm">Type: {file.type}</p>
                <a href={file.url} download className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">Download</a>
            </div>
        </div>
    );
};

export default Modal;
