// backend/app.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
// Load environment variables from .env
dotenv.config(); // <-- Make sure this is at the top

const fileRoutes = require('./routes/fileRoutes');
const app = express();

// Middleware
app.use(express.json());

// Enable CORS for all routes
app.use(cors());
// app.use(cors({
//     origin: 'http://localhost:3000' // Replace with your frontend URL
// }));

// Routes
app.use('/api/files', fileRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
