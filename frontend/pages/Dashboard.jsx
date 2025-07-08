import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiImage, FiVolume2, FiFilm, FiHome, FiUser, FiLogOut, FiArrowRight, FiLoader, FiAlertCircle, FiSettings, FiEdit } from 'react-icons/fi';
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
               setUserData(data);
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

               // Prepare request based on service type
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
                         // Start progress simulation
                         const interval = setInterval(() => {
                              setVideoProgress(prev => {
                                   const newProgress = prev + Math.random() * 5; // Slower progress for video
                                   return newProgress >= 95 ? 95 : newProgress; // Leave 5% for final processing
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

               // Handle different response types
               switch (activeService) {
                    case 'text-to-image':
                         if (!data.image) throw new Error('No image URL received');
                         setOutput(data.image);
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
                              setVideoProgress(100); // Complete the progress bar
                         }
                         if (!data.videoUrl) throw new Error('No video URL received');
                         setOutput(data.videoUrl);
                         break;
               }

          } catch (err) {
               setError(err.message);
               console.error('API Error:', err);
          } finally {
               setLoading(false);
          }
     };

     // In your JSX, add this for better error display:
     {
          error && (
               <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg"
               >
                    <FiAlertCircle />
                    <div>
                         <p className="font-medium">Error generating video</p>
                         <p className="text-sm">{error}</p>
                         {activeService === 'text-to-video' && (
                              <p className="text-xs mt-1">
                                   Please check your Replicate API token and try again.
                              </p>
                         )}
                    </div>
               </motion.div>
          )
     }

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

     const resetService = () => {
          setActiveService(null);
          setPrompt('');
          setOutput('');
          setError('');
          setVideoProgress(0);
     };

     return (
          <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
               {/* Sidebar */}
               <div className={`fixed inset-y-0 left-0 w-64 p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg z-10`}>
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
                              }}
                              className={`flex items-center w-full p-3 rounded-lg ${!activeService && !showProfile ? (darkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-600') :
                                   (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                                   }`}
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
                                   }}
                                   className={`flex items-center w-full p-3 rounded-lg ${activeService === service.id ? (darkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-600') :
                                        (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                                        }`}
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
                              }}
                              className={`flex items-center w-full p-3 rounded-lg ${showProfile ? (darkMode ? 'bg-gray-700' : 'bg-blue-100 text-blue-600') :
                                   (darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
                                   }`}
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
                              className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700 text-red-500"
                         >
                              <FiLogOut className="mr-3" />
                              Logout
                         </button>
                    </div>
               </div>

               {/* Main Content */}
               <div className="ml-64 p-8">
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
                                                  <div className="flex items-center justify-between">
                                                       <div className="flex items-center">
                                                            <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl">
                                                                 {userData.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="ml-6">
                                                                 <h2 className="text-2xl font-bold">{userData.name}</h2>
                                                                 <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{userData.email}</p>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                       <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                            <h3 className="font-medium mb-3">Account Details</h3>
                                                            <div className="space-y-2">
                                                                 <div>
                                                                      <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
                                                                      <p>{new Date(userData.createdAt).toLocaleDateString()}</p>
                                                                 </div>
                                                                 <div>
                                                                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                                                                      <p>{new Date(userData.lastLogin).toLocaleString()}</p>
                                                                 </div>
                                                            </div>
                                                       </div>

                                                       <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                            <h3 className="font-medium mb-3">Usage Statistics</h3>
                                                            <div className="space-y-2">
                                                                 <div>
                                                                      <p className="text-sm text-gray-500 dark:text-gray-400">Images Generated</p>
                                                                      <p>{userData.usage?.images || 0}</p>
                                                                 </div>
                                                                 <div>
                                                                      <p className="text-sm text-gray-500 dark:text-gray-400">Audio Files Created</p>
                                                                      <p>{userData.usage?.audio || 0}</p>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>

                                                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                       <h3 className="font-medium mb-3">Settings</h3>
                                                       <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                 <div>
                                                                      <p className="font-medium">Dark Mode</p>
                                                                      <p className="text-sm text-gray-500 dark:text-gray-400">Toggle dark theme</p>
                                                                 </div>
                                                                 <button
                                                                      onClick={() => setDarkMode(!darkMode)}
                                                                      className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                                                                           }`}
                                                                 >
                                                                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'
                                                                           }`} />
                                                                 </button>
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

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                   {services.map(service => (
                                        <motion.div
                                             key={service.id}
                                             whileHover={{ y: -5 }}
                                             whileTap={{ scale: 0.98 }}
                                             onClick={() => setActiveService(service.id)}
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
                                   <div className={`h-2 bg-gradient-to-r ${services.find(s => s.id === activeService)?.color || 'from-gray-500 to-gray-700'
                                        }`}></div>

                                   <div className="p-6">
                                        <div className="flex items-center mb-6">
                                             <div className={`p-3 rounded-lg bg-gradient-to-br ${services.find(s => s.id === activeService)?.color || 'from-gray-500 to-gray-700'
                                                  } text-white`}>
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
                                                       className={`w-full p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                                                            }`}
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

                                             {/* Video progress indicator */}
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
                                                                      <img
                                                                           src={output}
                                                                           alt="Generated from AI"
                                                                           className="w-full h-auto object-cover"
                                                                      />
                                                                      <div className={`p-3 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-50 text-gray-600'}`}>
                                                                           Generated from: "{prompt}"
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

                                                            {activeService === 'text-to-video' && loading && (
                                                                 <div className="mt-4">
                                                                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                                           <div
                                                                                className="bg-blue-600 h-2.5 rounded-full"
                                                                                style={{ width: `${videoProgress}%` }}
                                                                           ></div>
                                                                      </div>
                                                                      <p className="text-sm text-gray-500 mt-2">
                                                                           {videoProgress < 50 ? 'Generating initial image...' :
                                                                                videoProgress < 95 ? 'Creating video from image...' :
                                                                                     'Finalizing video...'}
                                                                      </p>
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