import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PageNotFound = ({ darkMode }) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`max-w-md w-full p-8 rounded-xl text-center ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <div className="text-9xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
          404
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            <FiArrowLeft />
            Go Back
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md hover:shadow-lg`}
          >
            <FiHome />
            Return Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default PageNotFound;