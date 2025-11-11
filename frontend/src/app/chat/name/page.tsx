// app/update-name/page.tsx - Enhanced Premium Version
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function UpdateNamePage() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  // Simulate progress for better UX
  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 90) {
            clearInterval(timer);
            return 90;
          }
          return oldProgress + 10;
        });
      }, 200);
      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [isLoading]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setProgress(0);

    try {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
      };

      const token = getCookie('token');

      const response = await fetch('http://localhost:5000/api/v1/update/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();
      setProgress(100);

      if (response.ok) {
        setMessage('Profile updated successfully');
        Cookies.remove("token")
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      } else {
        setMessage(data.message || 'Unable to update profile. Please try again.');
      }
    } catch (error) {
      setProgress(100);
      setMessage('Network connection error. Please check your internet.');
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Premium Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
          {/* Header with gradient and back button */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 relative">
            {/* Back Button */}
            <button
              onClick={() => router.push('/chat')}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-all duration-200 backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-3 justify-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Update Profile</h1>
                <p className="text-blue-100 text-sm">Manage your account information</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="w-full bg-gray-200 h-1">
              <div 
                className="bg-blue-600 h-1 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Form Content */}
          <div className="px-8 py-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Full Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 outline-none text-gray-900 placeholder-gray-500 bg-white group-hover:border-gray-400"
                    required
                    minLength={2}
                    maxLength={50}
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">This name will be visible to other users</p>
              </div>

              <div className="flex space-x-3">
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => router.push('/chat')}
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                >
                  Cancel
                </button>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-blue-100 disabled:ring-0 disabled:cursor-not-allowed transform hover:shadow-lg disabled:hover:shadow-none flex items-center justify-center space-x-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Status Message */}
            {message && (
              <div className={`mt-6 p-4 rounded-xl border-2 transition-all duration-300 ${
                message.includes('successfully') 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.includes('successfully') 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {message.includes('successfully') ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      message.includes('successfully') ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {message}
                    </p>
                    {message.includes('successfully') && (
                      <p className="text-xs text-green-600 mt-1">
                        Redirecting to login...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secured connection</span>
              </div>
              <span>Profile Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}