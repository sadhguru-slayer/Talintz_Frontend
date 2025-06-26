import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from 'antd';
import { FaSignOutAlt } from 'react-icons/fa';

export const LogoutButton = ({ isCollapsed, onLogout, iconClass, isLoggingOut }) => {
  if (!isCollapsed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full px-4 py-4 bg-gradient-to-b from-transparent to-[#F8FAFD]"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-50/80 text-sm group transition-all duration-200"
          disabled={isLoggingOut}
        >
          <FaSignOutAlt className={`${iconClass} text-[#4A5568] group-hover:text-red-600`} />
          <span className="font-medium text-[#4A5568] group-hover:text-red-600">
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </span>
        </motion.button>
        <p className="mt-3 text-[10px] text-center text-[#718096]">
          © {new Date().getFullYear()} Talintz Hub
        </p>
      </motion.div>
    );
  }

  return (
    <Tooltip title="Logout" placement="right" color="#1A365D">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onLogout}
        className="p-2 my-4 rounded-lg hover:bg-red-50/80 group transition-all duration-200"
        disabled={isLoggingOut}
      >
        <FaSignOutAlt className={`${iconClass} text-[#4A5568] group-hover:text-red-600`} />
      </motion.button>
    </Tooltip>
  );
}; 