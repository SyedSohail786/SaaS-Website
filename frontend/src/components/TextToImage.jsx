import React, { useEffect, useState } from 'react'; 
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function TextToImage() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useNavigate();

  useEffect(() => {
       if(localStorage.getItem('token') === null || localStorage.getItem('token') === undefined) {
        router('/auth');
       }
    }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (data.image?.startsWith('data:image') || data.image?.startsWith('http')) {
        setImage(data.image);
      } else {
        throw new Error(data.error || 'Image generation failed');
      }
    } catch (err) {
      setError(err.message);
      setImage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <FiImage className="text-indigo-500 text-2xl" />
        <h2 className="text-2xl font-bold text-gray-800">AI Image Generator</h2>
      </div>

      <motion.div layout className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Describe your image
          </label>
          <motion.textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            placeholder="A futuristic cityscape at sunset with flying cars..."
            whileFocus={{ scale: 1.01 }}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg"
            >
              <FiAlertCircle />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
            loading || !prompt.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
          } transition-all`}
          whileHover={!loading && prompt.trim() ? { scale: 1.02 } : {}}
          whileTap={!loading && prompt.trim() ? { scale: 0.98 } : {}}
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <FiLoader />
              </motion.span>
              Generating...
            </>
          ) : (
            'Generate Image'
          )}
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {image && (
          <motion.div
            key="image-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-md">
              <img
                src={image}
                alt="Generated from AI"
                className="w-full h-auto object-cover"
              />
              <div className="p-3 bg-gray-50 text-sm text-gray-500">
                Generated from: "{prompt}"
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !image && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5,
                delay: i * 0.1
              }}
              className="h-32 bg-gray-200 rounded-lg"
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}