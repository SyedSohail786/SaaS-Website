const axios = require('axios');
const User = require('../models/User');

exports.generateImage = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === '') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        input: {
          prompt: prompt,
          width: 512,
          height: 512,
          guidance_scale: 7.5,
          num_inference_steps: 30
        }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const predictionId = response.data.id;
    let result;

    // Poll every 2 seconds until the result is ready
    while (true) {
      const poll = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );

      if (poll.data.status === 'succeeded') {
        result = poll.data.output[0];
        break;
      } else if (poll.data.status === 'failed') {
        throw new Error('Image generation failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Update user's image usage count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'usage.images': 1 },
      lastLogin: new Date()
    });

    res.json({ image: result });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message || 'Internal server error',
    });
  }
};