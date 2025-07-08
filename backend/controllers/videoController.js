const axios = require('axios');

exports.generateVideo = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ 
      error: 'Prompt is required and must be a string' 
    });
  }

  try {
    // First generate an image from the prompt
    const imageResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316',
        input: { prompt }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const imageId = imageResponse.data.id;
    let imageUrl;
    let attempts = 0;
    const maxAttempts = 20;

    // Wait for image generation to complete
    while (attempts < maxAttempts) {
      attempts++;
      const pollResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${imageId}`,
        {
          headers: { 
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` 
          },
        }
      );

      if (pollResponse.data.status === 'succeeded') {
        imageUrl = pollResponse.data.output[0];
        break;
      } else if (pollResponse.data.status === 'failed') {
        throw new Error('Image generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!imageUrl) {
      throw new Error('Image generation timed out');
    }

    // Now generate video from the image
    const videoResponse = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438',
        input: {
          input_image: imageUrl,
          motion_bucket_id: 127,
          fps: 6,
          cond_aug: 0.02,
          decoding_t: 7,
          seed: 42
        }
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const videoId = videoResponse.data.id;
    let videoUrl;
    attempts = 0;

    // Wait for video generation to complete
    while (attempts < maxAttempts) {
      attempts++;
      const pollResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${videoId}`,
        {
          headers: { 
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` 
          },
        }
      );

      if (pollResponse.data.status === 'succeeded') {
        videoUrl = pollResponse.data.output[0];
        break;
      } else if (pollResponse.data.status === 'failed') {
        throw new Error('Video generation failed');
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out');
    }

    res.json({ 
      success: true,
      videoUrl
    });

  } catch (error) {
    console.error('Video generation error:', error.response?.data || error.message);
    
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.detail || 
                        error.response?.data?.error || 
                        error.message ||
                        'Video generation failed';
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.response?.data || null
    });
  }
};