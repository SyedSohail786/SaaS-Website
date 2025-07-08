'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiVolume2, FiLoader, FiCopy, FiCheck } from 'react-icons/fi';
import { useCopyToClipboard } from 'react-use';
import { useNavigate } from 'react-router-dom';

export default function TextToSpeech() {
     const [text, setText] = useState('');
     const [audio, setAudio] = useState(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [copied, setCopied] = useState(false);
     const audioRef = useRef(null);
     const [_, copyToClipboard] = useCopyToClipboard();
     const router = useNavigate();

     useEffect(() => {
          if (localStorage.getItem('token') === null || localStorage.getItem('token') === undefined) {
               router('/auth');
          }
     }, []);

     const handleConvert = async () => {
          if (!text.trim()) {
               setError('Please enter some text');
               return;
          }

          try {
               setError('');
               setLoading(true);
               setAudio(null);

               const res = await fetch('http://localhost:8000/api/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text }),
               });

               if (!res.ok) throw new Error('Conversion failed');

               const data = await res.json();
               const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))], {
                    type: 'audio/mp3'
               });
               setAudio(URL.createObjectURL(audioBlob));
          } catch (err) {
               setError(err.message || 'Failed to convert text to speech');
          } finally {
               setLoading(false);
          }
     };

     const handleCopy = () => {
          copyToClipboard(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
     };

     return (
          <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-3xl mx-auto p-4 sm:p-6"
          >
               <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 sm:p-6">
                         <div className="flex items-center gap-3">
                              <FiVolume2 className="text-white text-2xl" />
                              <h2 className="text-xl sm:text-2xl font-bold text-white">Text to Speech Converter</h2>
                         </div>
                         <p className="text-blue-100 mt-1">Convert any text to natural sounding speech</p>
                    </div>

                    {/* Main Content */}
                    <div className="p-4 sm:p-6">
                         {/* Text Input */}
                         <div className="relative">
                              <motion.textarea
                                   value={text}
                                   onChange={(e) => setText(e.target.value)}
                                   rows={5}
                                   className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                   placeholder="Enter your text here..."
                                   whileFocus={{
                                        borderColor: "#3b82f6",
                                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)"
                                   }}
                              />
                              {text && (
                                   <motion.button
                                        onClick={handleCopy}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="absolute top-2 right-2 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
                                        title="Copy text"
                                   >
                                        {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
                                   </motion.button>
                              )}
                         </div>

                         {/* Error Message */}
                         <AnimatePresence>
                              {error && (
                                   <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2"
                                   >
                                        <FiAlertCircle className="mt-0.5 flex-shrink-0" />
                                        <span>{error}</span>
                                   </motion.div>
                              )}
                         </AnimatePresence>

                         {/* Convert Button */}
                         <motion.button
                              onClick={handleConvert}
                              disabled={loading || !text.trim()}
                              className={`mt-4 w-full sm:w-auto px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${loading || !text.trim()
                                        ? 'bg-gray-300 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                                   } transition-all`}
                              whileHover={(!loading && text.trim()) ? { scale: 1.02 } : {}}
                              whileTap={(!loading && text.trim()) ? { scale: 0.98 } : {}}
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
                                   'Convert to Speech'
                              )}
                         </motion.button>

                         {/* Audio Player */}
                         <AnimatePresence>
                              {audio && (
                                   <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200"
                                   >
                                        <div className="flex items-center justify-between mb-2">
                                             <h3 className="font-medium text-gray-700">Your Audio</h3>
                                             <button
                                                  onClick={() => audioRef.current?.play()}
                                                  className="text-sm text-blue-500 hover:text-blue-700"
                                             >
                                                  Play Again
                                             </button>
                                        </div>
                                        <audio
                                             ref={audioRef}
                                             controls
                                             src={audio}
                                             className="w-full"
                                             onPlay={() => {
                                                  // Animation when audio plays
                                                  const waves = document.querySelectorAll('.audio-wave');
                                                  waves.forEach(wave => {
                                                       wave.style.animation = 'audio-wave 1.5s infinite ease-in-out';
                                                  });
                                             }}
                                        >
                                             Your browser does not support the audio element.
                                        </audio>
                                        {/* Visual audio waves */}
                                        <div className="flex items-end gap-1 mt-3 h-8">
                                             {[...Array(8)].map((_, i) => (
                                                  <motion.div
                                                       key={i}
                                                       className="audio-wave w-1 bg-blue-400 rounded-t"
                                                       initial={{ height: '30%' }}
                                                       style={{ height: `${Math.random() * 30 + 20}%` }}
                                                  />
                                             ))}
                                        </div>
                                   </motion.div>
                              )}
                         </AnimatePresence>
                    </div>
               </div>

               {/* Add CSS for audio wave animation */}
               <style jsx>{`
        @keyframes audio-wave {
          0% { height: 30%; }
          50% { height: 80%; }
          100% { height: 30%; }
        }
        .audio-wave:nth-child(1) { animation-delay: 0.1s; }
        .audio-wave:nth-child(2) { animation-delay: 0.3s; }
        .audio-wave:nth-child(3) { animation-delay: 0.5s; }
        .audio-wave:nth-child(4) { animation-delay: 0.7s; }
        .audio-wave:nth-child(5) { animation-delay: 0.9s; }
        .audio-wave:nth-child(6) { animation-delay: 1.1s; }
        .audio-wave:nth-child(7) { animation-delay: 1.3s; }
        .audio-wave:nth-child(8) { animation-delay: 1.5s; }
      `}</style>
          </motion.div>
     );
}