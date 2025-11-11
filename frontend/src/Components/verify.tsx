"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "./loading";

export default function VerifyOtp() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const { isAuth, setIsAuth, setUser, loading: userLoading, fetchChats, fetchUsers } = useAppData();

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [success, setSuccess] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError("");

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (newCode.every(digit => digit !== "") && index === 5) {
            handleSubmit();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (!code[index] && index > 0) {
                const newCode = [...code];
                newCode[index - 1] = "";
                setCode(newCode);
                inputRefs.current[index - 1]?.focus();
            } else if (code[index]) {
                const newCode = [...code];
                newCode[index] = "";
                setCode(newCode);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newCode = pastedData.split("").slice(0, 6);
            const paddedCode = [...newCode, ...Array(6 - newCode.length).fill("")];
            setCode(paddedCode);

            // Focus the last filled input
            const lastFilledIndex = Math.min(newCode.length - 1, 5);
            setTimeout(() => {
                inputRefs.current[lastFilledIndex]?.focus();
            }, 0);
        }
    };

    const handleSubmit = async () => {
        const verificationCode = code.join("");
        if (verificationCode.length !== 6) return;

        setLoading(true);
        setError("");

        try {
            const { data } = await axios.post(`${user_service}/api/v1/verify`, {
                email,
                otp: verificationCode
            });

            Cookies.set("token", data.token, { expires: 15, secure: false, path: "/" });
            
            setSuccess(true);
            setUser(data.user);
            setIsAuth(true);
            
            // Show success toast
            setShowToast(true);
            
            setTimeout(() => {
                fetchChats();
                fetchUsers();
                router.push("/chat");
            }, 1500);

        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Invalid verification code. Please try again."
            );
            // Clear code on error
            setCode(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (countdown > 0) return;

        setResendLoading(true);
        setError("");

        try {
            await axios.post(`${user_service}/api/v1/login`, { email });
            setCountdown(60);
            // Show toast for resend
            setShowToast(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to resend code");
        } finally {
            setResendLoading(false);
        }
    };

    // Fixed ref callback function
    const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
        inputRefs.current[index] = el;
    };

    if (userLoading) {
        return <Loading />
    }

    if (isAuth) redirect("/chat");

    return (
        <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
            {/* Success Toast */}
            {showToast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm">
                    <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-4 shadow-2xl border border-blue-500/30 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold text-sm">
                                    {success ? "Verification Successful!" : "Code Resent!"}
                                </p>
                                <p className="text-blue-100 text-xs truncate">
                                    {success ? "Redirecting to chat..." : `New code sent to ${email}`}
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
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    
                    <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
                        Verify Your Email
                    </h1>
                    
                    <p className="text-slate-300 text-sm mb-1">
                        Enter the 6-digit code sent to
                    </p>
                    <p className="text-cyan-300 font-medium text-sm truncate px-4">
                        {email}
                    </p>
                </div>

                {/* Verification Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
                    {/* Code Inputs */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-200 uppercase tracking-wider mb-4 text-center">
                            Verification Code
                        </label>

                        <div className="flex justify-center space-x-2 mb-3" onPaste={handlePaste}>
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={setInputRef(index)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-10 h-10 text-center text-white text-base font-semibold bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:bg-white/10 outline-none transition-all duration-200"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                        
                        <p className="text-slate-400 text-xs text-center">
                            Tip: Paste code or use arrow keys
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-400/30 px-3 py-2">
                            <p className="text-sm text-red-200 flex items-center">
                                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || code.some(digit => digit === "")}
                        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg active:scale-[0.98] mb-4"
                    >
                        <span className="flex items-center justify-center space-x-2">
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
                                    </svg>
                                    <span className="text-sm">Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">Verify Email</span>
                                </>
                            )}
                        </span>
                    </button>

                    {/* Resend Code Section */}
                    <div className="text-center border-t border-white/10 pt-4">
                        <p className="text-slate-300 text-sm mb-3">
                            Didn't receive the code?
                        </p>

                        <button
                            onClick={handleResendCode}
                            disabled={countdown > 0 || resendLoading}
                            className="text-cyan-300 hover:text-cyan-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1 mx-auto"
                        >
                            {resendLoading ? (
                                <>
                                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="text-xs">Sending...</span>
                                </>
                            ) : countdown > 0 ? (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs">Resend in {countdown}s</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span className="text-xs">Resend code</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes toast-slide-in {
                    from { 
                        opacity: 0; 
                        transform: translate(-50%, -20px); 
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

                .fixed.top-4 {
                    animation: toast-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }

                .animate-toast-progress {
                    animation: toast-progress 2s linear forwards;
                }

                /* Prevent scrolling */
                body {
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}