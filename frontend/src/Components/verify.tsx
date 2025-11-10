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

    const { isAuth, setIsAuth, setUser,loading:userLoading,fetchChats,fetchUsers } = useAppData();

    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [success, setSuccess] = useState(false);

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
        if (value.length > 1) return;

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
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        if (/^\d+$/.test(pastedData)) {
            const newCode = pastedData.split("").slice(0, 6);
            setCode([...newCode, ...Array(6 - newCode.length).fill("")]);

            // Focus the last filled input
            const lastFilledIndex = Math.min(newCode.length - 1, 5);
            setTimeout(() => {
                inputRefs.current[lastFilledIndex]?.focus();
            }, 0);
        }
    };

    const handleSubmit = async () => {
        const verificationCode = code.join("");



        setLoading(true);
        setError("");

        try {
            console.log({ email, verificationCode });

            // Simulate API call - replace with your actual endpoint
            const otp = verificationCode;
            const { data } = await axios.post(`${user_service}/api/v1/verify`, {
                email,
                otp
            });
            console.log(data);

            Cookies.set("token", data.token, { expires: 15, secure: false, path: "/" })

            setSuccess(true);
            setTimeout(() => {
                router.push("/chat");
            }, 1500);

            setUser(data.user);
            setIsAuth(true);
            fetchChats();
            fetchUsers();

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


    if(userLoading) {
        return <Loading/>
    }


    if (isAuth) redirect("/chat");

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Success Overlay */}
                {success && (
                    <div className="fixed inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-50">
                        <div className="text-center text-white">
                            <div className="text-6xl mb-4">✅</div>
                            <h2 className="text-2xl font-bold mb-2">Verification Successful!</h2>
                            <p className="text-green-100">Redirecting to your dashboard...</p>
                        </div>
                    </div>
                )}

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <span className="text-xl text-white">🔐</span>
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        Verify Your Email
                    </h1>

                    <p className="text-blue-200 text-sm mb-1">
                        Enter the 6-digit code sent to
                    </p>
                    <p className="text-cyan-300 font-medium text-sm">
                        {email}
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6">
                    {/* Code Inputs */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-blue-100 mb-4 text-center">
                            Verification Code
                        </label>

                        <div className="flex justify-center space-x-3" onPaste={handlePaste}>
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
                                    className="w-12 h-12 text-center text-white text-xl font-semibold bg-white/5 border border-white/20 rounded-lg focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 outline-none transition-all"
                                    disabled={loading}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
                            <p className="text-red-300 text-sm text-center">⚠️ {error}</p>
                        </div>
                    )}

                    {/* Verify Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || code.some(digit => digit === "")}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 rounded-lg font-medium disabled:opacity-50 hover:opacity-90 transition-opacity mb-4"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Verifying...
                            </div>
                        ) : (
                            "Verify Email"
                        )}
                    </button>

                    {/* Resend Code Section */}
                    <div className="text-center border-t border-white/10 pt-4">
                        <p className="text-blue-200 text-sm mb-3">
                            Didn't receive the code?
                        </p>

                        <button
                            onClick={handleResendCode}
                            disabled={countdown > 0 || resendLoading}
                            className="text-cyan-300 hover:text-cyan-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {resendLoading ? (
                                "Sending..."
                            ) : countdown > 0 ? (
                                `Resend code in ${countdown}s`
                            ) : (
                                "Resend verification code"
                            )}
                        </button>
                    </div>
                </div>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push("/login")}
                        className="text-blue-300 hover:text-blue-200 text-sm transition-colors"
                    >
                        ← Back to login
                    </button>
                </div>

                {/* Footer */}
                <footer className="text-center mt-8">
                    <p className="text-blue-300/50 text-xs">
                        © 2024 ChatApp. Secure verification.
                    </p>
                </footer>
            </div>
        </div>
    );
}