import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiImage, FiVolume2, FiFilm, FiHome, FiUser,
  FiLogOut, FiArrowRight, FiLoader, FiAlertCircle,
  FiDownload, FiMenu, FiX
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AIDashboard = () => {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
    } else {
      fetchUserData();
    }
  }, [navigate]);

  const fetchUserData = async () => {
    setLoadingUser(true);
    try {
      const response = await fetch('http://localhost:8000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch user data');
      
      // Ensure usage data exists with default values
      const userWithDefaults = {
        ...data,
        usage: {
          images: data.usage?.images || 0,
          audio: data.usage?.audio || 0,
          videos: data.usage?.videos || 0
        },
        createdAt: data.createdAt || new Date(),
        lastLogin: data.lastLogin || new Date()
      };
      
      setUserData(userWithDefaults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');
    setVideoProgress(0);

    try {
      let requestBody;
      let endpoint;

      switch (activeService) {
        case 'text-to-image':
          endpoint = 'http://localhost:8000/api/image';
          requestBody = { prompt };
          break;
        case 'text-to-speech':
          endpoint = 'http://localhost:8000/api/tts';
          requestBody = { text: prompt };
          break;
        case 'text-to-video':
          endpoint = 'http://localhost:8000/api/video';
          requestBody = { prompt };
          const interval = setInterval(() => {
            setVideoProgress(prev => {
              const newProgress = prev + Math.random() * 5;
              return newProgress >= 95 ? 95 : newProgress;
            });
          }, 1000);
          requestBody._intervalId = interval;
          break;
        default:
          throw new Error('Invalid service selected');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      switch (activeService) {
        case 'text-to-image':
          if (!data.image) throw new Error('No image URL received');
          const imageResponse = await fetch(data.image);
          const imageBlob = await imageResponse.blob();
          const imageObjectURL = URL.createObjectURL(imageBlob);
          setOutput(imageObjectURL);
          break;
        case 'text-to-speech':
          if (!data.audioContent) throw new Error('No audio content received');
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
            { type: 'audio/mp3' }
          );
          setOutput(URL.createObjectURL(audioBlob));
          break;
        case 'text-to-video':
          if (requestBody._intervalId) {
            clearInterval(requestBody._intervalId);
            setVideoProgress(100);
          }
          if (!data.videoUrl) throw new Error('No video URL received');
          setOutput(data.videoUrl);
          break;
      }

      // Refresh user data to update usage stats
      await fetchUserData();

    } catch (err) {
      setError(err.message);
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'ai-generated-image.png';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const resetService = () => {
    setActiveService(null);
    setPrompt('');
    setOutput('');
    setError('');
    setVideoProgress(0);
  };

  useEffect(() => {
    setPrompt('');
    setOutput('');
    setError('');
    setVideoProgress(0);
  }, [activeService]);

  const services = [
    {
      id: 'text-to-image',
      title: 'Text to Image',
      icon: <FiImage size={24} />,
      color: 'from-purple-500 to-pink-500',
      placeholder: 'Describe the image you want to generate...',
      actionText: 'Generate Image'
    },
    {
      id: 'text-to-speech',
      title: 'Text to Speech',
      icon: <FiVolume2 size={24} />,
      color: 'from-blue-500 to-cyan-500',
      placeholder: 'Enter text to convert to speech...',
      actionText: 'Convert to Speech'
    },
    {
      id: 'text-to-video',
      title: 'Text to Video',
      icon: <FiFilm size={24} />,
      color: 'from-orange-500 to-red-500',
      placeholder: 'Describe the video you want to create...',
      actionText: 'Generate Video'
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Mobile Header */}
      <div className={`md:hidden flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-xl font-bold">AI Studio</h1>
        <div className="w-8"></div> {/* Empty div for layout balance */}
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(mobileMenuOpen || window.innerWidth >= 768) && (
          <motion.div
            ref={sidebarRef}
            initial={{ x: window.innerWidth >= 768 ? 0 : -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 w-64 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg z-20 md:z-10`}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-xl font-bold">AI Studio</h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveService(null);
                  setShowProfile(false);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full p-3 rounded-lg ${!activeService && !showProfile ? (darkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-600') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
              >
                <FiHome className="mr-3" />
                Dashboard
              </button>

              {services.map(service => (
                <button
                  key={service.id}
                  onClick={() => {
                    setActiveService(service.id);
                    setShowProfile(false);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full p-3 rounded-lg ${activeService === service.id ? (darkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-600') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
                >
                  {service.icon}
                  <span className="ml-3">{service.title}</span>
                </button>
              ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
              <button
                onClick={() => {
                  setShowProfile(true);
                  setActiveService(null);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full p-3 rounded-lg ${showProfile ? (darkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-600') : (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                  <FiUser />
                </div>
                <span className="ml-3">My Account</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/auth');
                }}
                className={`flex items-center w-full p-3 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} text-red-500`}
              >
                <FiLogOut className="mr-3" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`${mobileMenuOpen ? 'md:ml-64' : ''} md:ml-64 p-4 md:p-8 transition-all duration-300`}>
        {showProfile ? (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setShowProfile(false)}
              className="flex items-center text-blue-500 mb-6"
            >
              <FiArrowRight className="transform rotate-180 mr-2" />
              Back to dashboard
            </button>

            <div className={`rounded-xl overflow-hidden shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              <div className="p-6">
                {loadingUser ? (
                  <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin text-2xl" />
                  </div>
                ) : userData ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-4xl mb-4">
                        <FiUser size={40} />
                      </div>
                      <h2 className="text-2xl font-bold">{userData.name || 'User'}</h2>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{userData.email}</p>
                    </div>
                    
                    <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <h3 className="font-semibold mb-2">Account Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Joined</p>
                          <p>{new Date(userData.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Last Active</p>
                          <p>{new Date(userData.lastLogin).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <h3 className="font-semibold mb-2">Usage Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Images Generated</p>
                          <p className="text-2xl font-bold">{userData.usage.images}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Audio Files</p>
                          <p className="text-2xl font-bold">{userData.usage.audio}</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Videos Created</p>
                          <p className="text-2xl font-bold">{userData.usage.videos}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-red-500">Failed to load user data</p>
                    <button
                      onClick={fetchUserData}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : !activeService ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Welcome to AI Studio</h2>
            <p className="text-lg mb-8">Select a service to get started with AI-powered content creation</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map(service => (
                <motion.div
                  key={service.id}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveService(service.id);
                    setPrompt('');
                  }}
                  className={`rounded-xl overflow-hidden shadow-lg cursor-pointer ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white`}>
                        {service.icon}
                      </div>
                      <h3 className="ml-4 text-lg font-semibold">{service.title}</h3>
                    </div>
                    <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {service.id === 'text-to-image' && 'Generate stunning images from text descriptions'}
                      {service.id === 'text-to-speech' && 'Convert text into natural sounding audio'}
                      {service.id === 'text-to-video' && 'Create videos from text descriptions'}
                    </p>
                    <div className="flex items-center text-blue-500 font-medium">
                      <span>Try now</span>
                      <FiArrowRight className="ml-2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={resetService}
              className="flex items-center text-blue-500 mb-6"
            >
              <FiArrowRight className="transform rotate-180 mr-2" />
              Back to dashboard
            </button>

            <div className={`rounded-xl overflow-hidden shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`h-2 bg-gradient-to-r ${services.find(s => s.id === activeService)?.color || 'from-gray-500 to-gray-700'}`}></div>

              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${services.find(s => s.id === activeService)?.color || 'from-gray-500 to-gray-700'} text-white`}>
                    {services.find(s => s.id === activeService)?.icon}
                  </div>
                  <h2 className="ml-4 text-xl font-bold">
                    {services.find(s => s.id === activeService)?.title}
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Input
                    </label>
                    <motion.textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={5}
                      className={`w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`}
                      placeholder={services.find(s => s.id === activeService)?.placeholder}
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
                    onClick={handleSubmit}
                    disabled={loading || !prompt.trim()}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${loading || !prompt.trim()
                      ? (darkMode ? 'bg-gray-600' : 'bg-gray-300 cursor-not-allowed')
                      : `bg-gradient-to-r ${activeService === 'text-to-image' ? 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                        activeService === 'text-to-speech' ? 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' :
                          'from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                      } text-white shadow-md hover:shadow-lg`
                      } transition-all`}
                    whileHover={(!loading && prompt.trim()) ? { scale: 1.02 } : {}}
                    whileTap={(!loading && prompt.trim()) ? { scale: 0.98 } : {}}
                  >
                    {loading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <FiLoader />
                        </motion.span>
                        Processing...
                      </>
                    ) : (
                      services.find(s => s.id === activeService)?.actionText
                    )}
                  </motion.button>

                  {activeService === 'text-to-video' && loading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${videoProgress}%` }}
                      ></div>
                      <p className="text-sm text-gray-500 mt-1">
                        {videoProgress < 90 ? 'Generating video...' : 'Finalizing...'}
                      </p>
                    </div>
                  )}

                  <AnimatePresence mode="wait">
                    {output && (
                      <motion.div
                        key="output-container"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6"
                      >
                        <h3 className={`text-lg font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Result
                        </h3>

                        {activeService === 'text-to-image' && (
                          <div className={`rounded-xl overflow-hidden shadow-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                              <img
                                src={output}
                                alt="Generated from AI"
                                className="absolute w-full h-full object-contain"
                              />
                            </div>
                            <div className={`p-3 flex justify-between items-center ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                              <span className="truncate">Generated from: "{prompt}"</span>
                              <button
                                onClick={() => downloadImage(output, `ai-image-${Date.now()}.png`)}
                                className={`px-3 py-1 rounded-md flex items-center gap-1 ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-100 hover:bg-blue-200'} text-blue-600 whitespace-nowrap`}
                              >
                                <FiDownload className="inline" />
                                <span className="hidden sm:inline">Download</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {activeService === 'text-to-speech' && (
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <audio
                              controls
                              src={output}
                              className="w-full"
                            >
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        )}

                        {activeService === 'text-to-video' && (
                          <div className={`rounded-xl overflow-hidden shadow-md ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                              <video
                                src={output}
                                controls
                                className="absolute w-full h-full object-contain"
                              />
                            </div>
                            <div className={`p-3 flex justify-between items-center ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                              <span className="truncate">Generated from: "{prompt}"</span>
                              <a
                                href={output}
                                download={`ai-video-${Date.now()}.mp4`}
                                className={`px-3 py-1 rounded-md flex items-center gap-1 ${darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-100 hover:bg-blue-200'} text-blue-600 whitespace-nowrap`}
                              >
                                <FiDownload className="inline" />
                                <span className="hidden sm:inline">Download</span>
                              </a>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDashboard;