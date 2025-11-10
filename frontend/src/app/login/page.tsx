"use client";

import { useState, FormEvent, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "@/Components/loading";

export default function LoginPage() {

    const { loading: userLoading, isAuth } = useAppData()

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

            // Show toast
            setShowToast(true);

            // Redirect after 2 seconds
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

    // Auto-hide toast after 2 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    if (userLoading) return <Loading />
    
    if (isAuth) return redirect("/chat")

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-fade-in">
                    <div className="bg-green-500 rounded-lg p-4 shadow-lg border border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-xl">🎉</span>
                                <div>
                                    <h3 className="font-bold text-white text-sm">
                                        Verification Code Sent!
                                    </h3>
                                    <p className="text-green-100 text-xs">
                                        Check your inbox at <strong>{email}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="h-1 bg-white/30 rounded-full mt-2 w-full">
                            <div
                                className="h-1 bg-white rounded-full animate-progress"
                                style={{ animationDuration: '2s' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-xl text-white">💬</span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome to ChatApp
                    </h1>

                    <p className="text-blue-200 text-sm">
                        Enter your email to start chatting
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className="block mb-2 text-sm font-medium text-blue-100">
                                Email Address
                            </span>
                            <input
                                type="email"
                                name="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-blue-200/60 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoComplete="email"
                            />
                        </label>

                        {error && (
                            <p className="text-sm text-red-300 bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2">
                                ⚠️ {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-white font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
                        >
                            {loading ? "Sending Code..." : "Send Verification"}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <p className="text-blue-200/70 text-xs">
                            Secure & encrypted • No password required
                        </p>
                    </div>
                </div>

                <footer className="mt-6 text-center">
                    <p className="text-blue-300/50 text-xs">
                        © 2024 ChatApp. Connecting the world.
                    </p>
                </footer>
            </div>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-progress {
          animation: progress linear forwards;
        }
      `}</style>
        </div>
    );
}