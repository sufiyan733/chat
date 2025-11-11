// components/Toast.tsx
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message?: string;
  duration?: number;
  onClose?: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export default function Toast({ 
  message = 'Logged out successfully', 
  duration = 3000,
  onClose,
  type = 'success'
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Show toast with slight delay for smooth entrance
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev <= 0) {
          clearInterval(progressInterval);
          return 0;
        }
        return prev - (100 / (duration / 50));
      });
    }, 50);

    // Auto close timer
    const closeTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
      clearInterval(progressInterval);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out ";
    
    if (isVisible) {
      return baseStyles + "translate-x-0 opacity-100 scale-100";
    } else {
      return baseStyles + "translate-x-full opacity-0 scale-95";
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500';
      case 'error':
        return 'bg-gradient-to-r from-red-600 to-pink-600 border-red-500';
      case 'warning':
        return 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-500';
      case 'info':
        return 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500';
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-500';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className={`relative min-w-80 max-w-md rounded-2xl border shadow-2xl backdrop-blur-sm ${getTypeStyles()}`}>
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/20 rounded-t-2xl overflow-hidden">
          <div 
            className="h-full bg-white/40 transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Toast Content */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">
                {type === 'success' ? 'Success' : 
                 type === 'error' ? 'Error' :
                 type === 'warning' ? 'Warning' : 'Information'}
              </p>
              <p className="text-sm text-blue-100 mt-0.5">
                {message}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="flex-shrink-0 w-6 h-6 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm group"
            >
              <X className="w-3 h-3 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/30 rounded-full blur-sm" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white/20 rounded-full blur-sm" />
      </div>
    </div>
  );
}