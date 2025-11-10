// components/VerificationLoading.tsx
'use client';

import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verifying Account
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your details
          </p>
        </motion.div>

        {/* Animated Loader */}
        <div className="flex justify-center mb-8">
          <motion.div
            className="relative w-20 h-20"
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <motion.div
              className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.div>
          </motion.div>
        </div>

        {/* Dots Animation */}
        <div className="flex justify-center space-x-2 mb-8">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-indigo-600 rounded-full"
              initial={{ opacity: 0.3, y: 0 }}
              animate={{ opacity: 1, y: -10 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.2
              }}
            />
          ))}
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-700 text-sm">
            Securely processing your information...
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Loading;