const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const ttsRoutes = require('./routes/ttsRoutes');
const imageRoutes = require('./routes/imageRoutes');
const authRoutes = require('./routes/authRoutes');

const userController = require('./controllers/userController');
const authMiddleware = require('./middleware/authMiddleware');
const { generateVideo } = require('./controllers/videoController');

dotenv.config();
const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourfrontend.com'],
  credentials: true,
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));


app.use('/api/tts', ttsRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/users/me', userController.getCurrentUser);
app.put('/update', authMiddleware, userController.updateUser);
app.post('/api/video', generateVideo);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));