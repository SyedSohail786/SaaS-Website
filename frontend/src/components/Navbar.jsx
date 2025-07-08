
import { FiUser, FiLogOut } from 'react-icons/fi';


export default function Navbar() {
  return (
    <div className="bg-gray-50">
     <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">AI Services Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <FiUser className="text-indigo-600" />
              </div>
              <span className="text-sm font-medium">User</span>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiLogOut className="text-gray-500" />
            </button>
          </div>
        </div>
      </header>
    </div>
  )
}
