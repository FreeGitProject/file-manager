// frontend/src/components/App.js

import React, { useEffect, useState } from 'react';
import FileUpload from './FileUpload';
import FileList from './FileList';
import { fetchFiles } from '../services/api';
import FileManager from './FileManager';

const App = () => {
    const [files, setFiles] = useState([]);

    const loadFiles = async () => {
        try {
            const fetchedFiles = await fetchFiles();
            setFiles(fetchedFiles); // Update state with fetched files
        } catch (error) {
            console.error('Error loading files:', error);
        }
    };

    useEffect(() => {
        loadFiles(); // Load files when the component mounts
    }, []);

    return (
        // <div>
        //     <h1>File Manager</h1>
        //     <FileUpload onFileUploaded={loadFiles} />
        //     <FileList files={files} onFileDeleted={loadFiles} />
        // </div>
        <div className="App">
        <FileManager />
    </div>
    );
};

export default App;
