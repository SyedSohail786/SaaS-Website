const axios = require('axios');
const User = require('../models/User');

exports.convertTextToSpeech = async (req, res) => {
  const { text } = req.body;
  try {
    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        input: { text },
        voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
        audioConfig: { audioEncoding: 'MP3' },
      }
    ).catch(error => {
      console.error('Error in TTS API call:', error.response ? error.response.data : error.message);
      throw new Error('Failed to convert text to speech');
    });

    // Update user's audio usage count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'usage.audio': 1 },
      lastLogin: new Date()
    });

    res.json({ audioContent: response.data.audioContent });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};