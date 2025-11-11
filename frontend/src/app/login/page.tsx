"use client";

import { useState, FormEvent, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "@/Components/loading";

export default function LoginPage() {
    const { loading: userLoading, isAuth } = useAppData();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);

        const trimmed = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${user_service}/api/v1/login`, { email: trimmed });
            setShowToast(true);
            setTimeout(() => {
                router.push(`/verify?email=${trimmed}`);
            }, 2000);
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Failed to send verification code.");
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    if (userLoading) return <Loading />;
    if (isAuth) return redirect("/chat");

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
            {/* Toast Notification - Fixed positioning */}
            {showToast && (
                <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-4 shadow-2xl border border-blue-500/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm">
                                    Verification code sent
                                </p>
                                <p className="text-blue-100 text-xs truncate">
                                    Check your inbox at {email}
                                </p>
                            </div>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full mt-3 w-full overflow-hidden">
                            <div 
                                className="h-full bg-white/30 rounded-full animate-toast-progress"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-sm">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-3xl font-light text-white mb-3 tracking-tight">
                        Welcome to <span className="font-semibold">ChatApp</span>
                    </h1>
                    
                    <p className="text-slate-300 text-sm font-light">
                        Enter your email to access your secure workspace
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block">
                                <span className="block mb-3 text-sm font-medium text-slate-200 uppercase tracking-wider">
                                    Email Address
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="enter your work email"
                                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-4 text-white placeholder-slate-400/60 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 focus:bg-white/10"
                                    autoComplete="email"
                                />
                            </label>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-3">
                                <p className="text-sm text-red-200 flex items-center">
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg active:scale-[0.98]"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
                                        </svg>
                                        <span>Sending Verification Code...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span>Send Verification Code</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-center space-x-4 text-slate-400">
                            <div className="flex items-center space-x-1 text-xs">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Secure & Encrypted</span>
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-600" />
                            <div className="flex items-center space-x-1 text-xs">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>No Password</span>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>

            <style jsx global>{`
                @keyframes toast-slide-in {
                    from { 
                        opacity: 0; 
                        transform: translate(-50%, -100%); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translate(-50%, 0); 
                    }
                }

                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }

                .fixed.top-6 {
                    animation: toast-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .animate-toast-progress {
                    animation: toast-progress 2s linear forwards;
                }

                /* Prevent scrolling on the entire page */
                body {
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}