const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const ttsRoutes = require('./routes/ttsRoutes');
const videoRoutes = require('./controllers/videoController');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middleware/authMiddleware');
require('dotenv').config();

const app = express();
// Middleware
const corsOptions = {
  origin: [
    'http://localhost:8000',
    'https://saas-website-qvou.onrender.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, 
  optionsSuccessStatus: 200 
};
// Apply CORS middleware
app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/image', authMiddleware, imageRoutes);
app.use('/api/tts',authMiddleware, ttsRoutes);
app.use('/api/video',authMiddleware, videoRoutes.generateVideo);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
