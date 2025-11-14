// "use client";

// import { useState, useRef, useEffect, KeyboardEvent } from "react";
// import { redirect, useRouter, useSearchParams } from "next/navigation";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useAppData } from "@/context/AppContext";
// import Loading from "./loading";
// import { userr_service } from "../../url";

// export default function VerifyOtp() {
//     const router = useRouter();
//     const searchParams = useSearchParams();
//     const email = searchParams.get("email") || "";

//     const { isAuth, setIsAuth, setUser, loading: userLoading, fetchChats, fetchUsers } = useAppData();

//     const [code, setCode] = useState(["", "", "", "", "", ""]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");
//     const [resendLoading, setResendLoading] = useState(false);
//     const [countdown, setCountdown] = useState(60);
//     const [success, setSuccess] = useState(false);
//     const [showToast, setShowToast] = useState(false);

//     const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

//     // Initialize refs array
//     useEffect(() => {
//         inputRefs.current = inputRefs.current.slice(0, 6);
//     }, []);

//     // Focus first input on mount
//     useEffect(() => {
//         inputRefs.current[0]?.focus();
//     }, []);

//     // Countdown timer for resend
//     useEffect(() => {
//         if (countdown > 0) {
//             const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
//             return () => clearTimeout(timer);
//         }
//     }, [countdown]);

//     const handleChange = (index: number, value: string) => {
//         if (!/^\d?$/.test(value)) return;

//         const newCode = [...code];
//         newCode[index] = value;
//         setCode(newCode);
//         setError("");

//         // Auto-focus next input
//         if (value && index < 5) {
//             inputRefs.current[index + 1]?.focus();
//         }

//         // Auto-submit when all fields are filled and this is last digit
//         if (newCode.every(digit => digit !== "") && index === 5) {
//             handleSubmit();
//         }
//     };

//     const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === "Backspace") {
//             if (!code[index] && index > 0) {
//                 const newCode = [...code];
//                 newCode[index - 1] = "";
//                 setCode(newCode);
//                 inputRefs.current[index - 1]?.focus();
//             } else if (code[index]) {
//                 const newCode = [...code];
//                 newCode[index] = "";
//                 setCode(newCode);
//             }
//         } else if (e.key === "ArrowLeft" && index > 0) {
//             inputRefs.current[index - 1]?.focus();
//         } else if (e.key === "ArrowRight" && index < 5) {
//             inputRefs.current[index + 1]?.focus();
//         }
//     };

//     const handlePaste = (e: React.ClipboardEvent) => {
//         e.preventDefault();
//         const pastedData = e.clipboardData.getData("text").slice(0, 6);
//         if (/^\d+$/.test(pastedData)) {
//             const newCode = pastedData.split("").slice(0, 6);
//             const paddedCode = [...newCode, ...Array(6 - newCode.length).fill("")];
//             setCode(paddedCode);

//             // Focus the last filled input
//             const lastFilledIndex = Math.min(newCode.length - 1, 5);
//             setTimeout(() => {
//                 inputRefs.current[lastFilledIndex]?.focus();
//             }, 0);
//         }
//     };

//     const handleSubmit = async () => {
//         const verificationCode = code.join("");
//         if (verificationCode.length !== 6) return;

//         setLoading(true);
//         setError("");

//         try {
//             console.log({email,verificationCode});
//             const { data } = await axios.post(`${userr_service}/api/v1/verify`, {
//                 email,
//                 otp: verificationCode
//             });
            
            

//             // Token lifetime and secure flag depend on your deployment; adjust as needed
//             Cookies.set("token", data.token, { expires: 15, path: "/" });

//             setSuccess(true);
//             setUser?.(data.user);
//             setIsAuth?.(true);

//             // Show success toast
//             setShowToast(true);

//             setTimeout(() => {
//                 fetchChats?.();
//                 fetchUsers?.();
//                 router.push("/chat");
//             }, 1500);
//         } catch (err: any) {
//             console.log(err);
            
//             setError(
//                 err?.response?.data?.message ||
//                 "Invalid verification code. Please try again."
//             );
//             // Clear code on error
//             setCode(["", "", "", "", "", ""]);
//             inputRefs.current[0]?.focus();
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleResendCode = async () => {
//         if (countdown > 0) return;

//         setResendLoading(true);
//         setError("");

//         try {
//             await axios.post(`${userr_service}/api/v1/login`, { email });
//             setCountdown(60);
//             setShowToast(true);
//         } catch (err: any) {
//             setError(err?.response?.data?.message || "Failed to resend code");
//         } finally {
//             setResendLoading(false);
//         }
//     };

//     // Fixed ref callback function
//     const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
//         inputRefs.current[index] = el;
//     };

//     if (userLoading) {
//         return <Loading />;
//     }

//     if (isAuth) redirect("/chat");

//     return (
//         <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
//             {/* Success / Resend Toast */}
//             {showToast && (
//                 <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm">
//                     <div className="bg-gradient-to-r from-blue-700 to-blue-800 rounded-xl p-4 shadow-2xl border border-blue-500/30 backdrop-blur-sm">
//                         <div className="flex items-center space-x-3">
//                             <div className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
//                                 <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                 </svg>
//                             </div>
//                             <div className="flex-1 min-w-0">
//                                 <p className="text-white font-semibold text-sm">
//                                     {success ? "Verification Successful!" : "Code Resent!"}
//                                 </p>
//                                 <p className="text-blue-100 text-xs truncate">
//                                     {success ? "Redirecting to chat..." : `New code sent to ${email}`}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className="h-1 bg-white/10 rounded-full mt-3 w-full overflow-hidden">
//                             <div
//                                 className="h-full bg-white/30 rounded-full animate-toast-progress"
//                             />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <div className="w-full max-w-sm">
//                 {/* Header */}
//                 <div className="text-center mb-6">
//                     <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl">
//                         <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
//                         </svg>
//                     </div>

//                     <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
//                         Verify Your Email
//                     </h1>

//                     <p className="text-slate-300 text-sm mb-1">
//                         Enter the 6-digit code sent to
//                     </p>
//                     <p className="text-cyan-300 font-medium text-sm truncate px-4">
//                         {email}
//                     </p>
//                 </div>

//                 {/* Verification Card */}
//                 <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
//                     {/* Code Inputs */}
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-slate-200 uppercase tracking-wider mb-4 text-center">
//                             Verification Code
//                         </label>

//                         <div className="flex justify-center space-x-2 mb-3" onPaste={handlePaste}>
//                             {code.map((digit, index) => (
//                                 <input
//                                     key={index}
//                                     ref={setInputRef(index)}
//                                     type="text"
//                                     inputMode="numeric"
//                                     pattern="[0-9]*"
//                                     maxLength={1}
//                                     value={digit}
//                                     onChange={(e) => handleChange(index, e.target.value)}
//                                     onKeyDown={(e) => handleKeyDown(index, e)}
//                                     className="w-10 h-10 text-center text-white text-base font-semibold bg-white/5 border border-white/10 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:bg-white/10 outline-none transition-all duration-200"
//                                     disabled={loading}
//                                 />
//                             ))}
//                         </div>

//                         <p className="text-slate-400 text-xs text-center">
//                             Tip: Paste code or use arrow keys
//                         </p>
//                     </div>

//                     {/* Error Message */}
//                     {error && (
//                         <div className="mb-4 rounded-lg bg-red-500/10 border border-red-400/30 px-3 py-2">
//                             <p className="text-sm text-red-200 flex items-center">
//                                 <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                                 {error}
//                             </p>
//                         </div>
//                     )}

//                     {/* Verify Button */}
//                     <button
//                         onClick={handleSubmit}
//                         disabled={loading || code.some(digit => digit === "")}
//                         className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg active:scale-[0.98] mb-4"
//                     >
//                         <span className="flex items-center justify-center space-x-2">
//                             {loading ? (
//                                 <>
//                                     <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
//                                     </svg>
//                                     <span className="text-sm">Verifying...</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                     <span className="text-sm">Verify Email</span>
//                                 </>
//                             )}
//                         </span>
//                     </button>

//                     {/* Resend Code Section */}
//                     <div className="text-center border-t border-white/10 pt-4">
//                         <p className="text-slate-300 text-sm mb-3">
//                             Didn't receive the code?
//                         </p>

//                         <button
//                             onClick={handleResendCode}
//                             disabled={countdown > 0 || resendLoading}
//                             className="text-cyan-300 hover:text-cyan-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1 mx-auto"
//                         >
//                             {resendLoading ? (
//                                 <>
//                                     <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                     </svg>
//                                     <span className="text-xs">Sending...</span>
//                                 </>
//                             ) : countdown > 0 ? (
//                                 <>
//                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                     <span className="text-xs">Resend in {countdown}s</span>
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                                     </svg>
//                                     <span className="text-xs">Resend code</span>
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>

//             <style jsx global>{`
//                 @keyframes toast-slide-in {
//                     from {
//                         opacity: 0;
//                         transform: translate(-50%, -20px);
//                     }
//                     to {
//                         opacity: 1;
//                         transform: translate(-50%, 0);
//                     }
//                 }

//                 @keyframes toast-progress {
//                     from { width: 100%; }
//                     to { width: 0%; }
//                 }

//                 .fixed.top-4 {
//                     animation: toast-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
//                 }

//                 .animate-toast-progress {
//                     animation: toast-progress 2s linear forwards;
//                 }

//                 /* Prevent scrolling */
//                 body {
//                     overflow: hidden;
//                 }
//             `}</style>
//         </div>
//     );
// }




"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useAppData } from "@/context/AppContext";
import Loading from "./loading";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as THREE from 'three';
import { userr_service } from "../../url";

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
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const formRef = useRef<HTMLDivElement>(null);

    // Premium mouse tracking
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { damping: 25, stiffness: 300 });
    const smoothY = useSpring(mouseY, { damping: 25, stiffness: 300 });

    const rotateX = useTransform(smoothY, [0, 1], [1, -1]);
    const rotateY = useTransform(smoothX, [0, 1], [-1, 1]);

    // Enter key event listener
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && code.every(digit => digit !== "")) {
                handleSubmit();
            }
        };

        // Add event listener to the window
        window.addEventListener('keydown', handleKeyPress as any);
        
        return () => {
            window.removeEventListener('keydown', handleKeyPress as any);
        };
    }, [code]);

    // Premium Three.js Background
    useEffect(() => {
        if (!canvasRef.current) return;

        let frameId: number;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvasRef.current, 
            alpha: true,
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);

        // Create premium floating particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 400; // Reduced for performance

        const posArray = new Float32Array(particlesCount * 3);
        const colorArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 40;
            colorArray[i] = Math.random() * 0.2 + 0.8;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.02, // Smaller particles
            vertexColors: true,
            transparent: true,
            opacity: 0.2, // More subtle
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 10;

        const handleMouseMove = (event: MouseEvent) => {
            mouseX.set(event.clientX / window.innerWidth);
            mouseY.set(event.clientY / window.innerHeight);
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            frameId = requestAnimationFrame(animate);

            particlesMesh.rotation.y += 0.0002; // Slower rotation
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            renderer.dispose();
        };
    }, []);

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 300);
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
        } else if (e.key === "Enter" && code.every(digit => digit !== "")) {
            handleSubmit();
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
            const { data } = await axios.post(`${userr_service}/api/v1/verify`, {
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
            await axios.post(`${userr_service}/api/v1/login`, { email });
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
        <div 
            className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-2.5 overflow-hidden relative"
            onMouseMove={(e) => {
                mouseX.set(e.clientX / window.innerWidth);
                mouseY.set(e.clientY / window.innerHeight);
            }}
            style={{ padding: '10px' }}
        >
            {/* Three.js Canvas Background */}
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 w-full h-full opacity-20"
            />

            {/* Premium Light Orbs */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl"
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.08, 0.12, 0.08],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-cyan-500/5 rounded-full blur-2xl"
                    animate={{
                        scale: [1.05, 1, 1.05],
                        opacity: [0.06, 0.1, 0.06],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                />
            </div>

            {/* Premium Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xs sm:max-w-sm"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                        <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/20 relative overflow-hidden mx-2">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                                <motion.div
                                    className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                >
                                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 font-semibold text-xs sm:text-sm truncate">
                                        {success ? "Access Granted" : "Code Resent"}
                                    </p>
                                    <p className="text-slate-600 text-xs truncate">
                                        {success ? "Welcome to Nexus" : `New code sent to ${email}`}
                                    </p>
                                </div>
                            </div>
                            <motion.div 
                                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500"
                                initial={{ width: "100%" }}
                                animate={{ width: "0%" }}
                                transition={{ duration: 2, ease: "linear" }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Container */}
            <motion.div 
                className="w-full max-w-xs sm:max-w-sm relative z-10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                    rotateX,
                    rotateY,
                }}
                ref={formRef}
            >
                {/* Compact Header */}
                <motion.div 
                    className="text-center mb-6 sm:mb-8"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <motion.div
                        className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl border border-slate-700/50 relative"
                        animate={{ 
                            y: [0, -4, 0],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <div className="absolute inset-0 bg-blue-500/10 rounded-xl sm:rounded-2xl blur-sm" />
                        <motion.svg 
                            className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 relative z-10" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            animate={{
                                scale: [1, 1.05, 1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </motion.svg>
                    </motion.div>
                    
                    <motion.h1 
                        className="text-xl sm:text-2xl font-light text-white mb-1 sm:mb-2 tracking-tight"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Verify{" "}
                        <span className="font-semibold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                            Identity
                        </span>
                    </motion.h1>
                    
                    <motion.p 
                        className="text-slate-400 text-xs mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        6-digit code sent to
                    </motion.p>
                    <motion.p 
                        className="text-cyan-300 font-medium text-xs truncate px-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {email}
                    </motion.p>
                </motion.div>

                {/* Compact Verification Card */}
                <motion.div
                    className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 shadow-xl relative overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    whileHover={{ 
                        y: -1,
                        transition: { type: "spring", stiffness: 400 }
                    }}
                >
                    {/* Compact Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                                            radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
                        }} />
                    </div>

                    {/* Code Inputs */}
                    <div className="mb-4 sm:mb-5 relative z-10">
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-widest mb-3 sm:mb-4 text-center">
                            Verification Code
                        </label>

                        <motion.div 
                            className="flex justify-center space-x-1 sm:space-x-2 mb-3"
                            onPaste={handlePaste}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {code.map((digit, index) => (
                                <motion.input
                                    key={index}
                                    ref={setInputRef(index)}
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-8 h-8 sm:w-10 sm:h-10 text-center text-white text-sm sm:text-base font-light bg-black/20 border border-slate-600/30 rounded-lg sm:rounded-xl focus:border-blue-500/50 focus:ring-1 sm:focus:ring-2 focus:ring-blue-500/20 focus:bg-black/30 outline-none transition-all duration-150 backdrop-blur-sm"
                                    disabled={loading}
                                    whileFocus={{
                                        scale: 1.05,
                                        borderColor: "rgba(59, 130, 246, 0.5)",
                                        backgroundColor: "rgba(0, 0, 0, 0.3)"
                                    }}
                                    whileHover={{
                                        scale: 1.02,
                                        borderColor: "rgba(59, 130, 246, 0.3)"
                                    }}
                                />
                            ))}
                        </motion.div>
                        
                       
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="mb-3 sm:mb-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 backdrop-blur-sm"
                                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, type: "spring" }}
                            >
                                <p className="text-xs sm:text-sm text-red-200 flex items-center font-light">
                                    <motion.svg 
                                        className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </motion.svg>
                                    {error}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Compact Verify Button */}
                    <motion.button
                        onClick={handleSubmit}
                        disabled={loading || code.some(digit => digit === "")}
                        className="w-full rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:shadow-lg relative overflow-hidden group mb-4"
                        whileHover={{ 
                            scale: loading ? 1 : 1.01,
                        }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        {/* Compact shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-700" />
                        
                        <span className="flex items-center justify-center space-x-1.5 sm:space-x-2 relative z-10">
                            {loading ? (
                                <>
                                    <motion.svg 
                                        className="w-4 h-4" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                        animate={{ 
                                            rotate: 360,
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ 
                                            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 0.5, repeat: Infinity }
                                        }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
                                    </motion.svg>
                                    <span className="text-xs sm:text-sm font-light">Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-xs sm:text-sm font-light">Verify & Continue</span>
                                </>
                            )}
                        </span>
                    </motion.button>

                    {/* Compact Resend Code Section */}
                    <motion.div 
                        className="text-center border-t border-slate-700/30 pt-3 sm:pt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                    >
                        <p className="text-slate-400 text-xs mb-2 sm:mb-3 font-light">
                            Didn't receive code?
                        </p>

                        <motion.button
                            onClick={handleResendCode}
                            disabled={countdown > 0 || resendLoading}
                            className="text-cyan-300 hover:text-cyan-200 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1.5 mx-auto group"
                            whileHover={{ scale: countdown > 0 ? 1 : 1.03 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {resendLoading ? (
                                <>
                                    <motion.svg 
                                        className="w-3 h-3" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </motion.svg>
                                    <span className="font-light text-xs">Sending...</span>
                                </>
                            ) : countdown > 0 ? (
                                <>
                                    <motion.svg 
                                        className="w-3 h-3" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: countdown, repeat: Infinity, ease: "linear" }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </motion.svg>
                                    <span className="font-light text-xs">{countdown}s</span>
                                </>
                            ) : (
                                <>
                                    <motion.svg 
                                        className="w-3 h-3" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                        whileHover={{ rotate: 180 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </motion.svg>
                                    <span className="font-light text-xs group-hover:underline">Resend code</span>
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* Compact Micro-Interaction Hints */}
                <motion.div 
                    className="text-center mt-3 sm:mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                >
                   
                </motion.div>
            </motion.div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
                
                body {
                    overflow: hidden;
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    font-weight: 300;
                }

                /* Ensure no scrolling on any device */
                html, body {
                    height: 100%;
                    overflow: hidden;
                }

                /* Premium scrollbar hiding */
                ::-webkit-scrollbar {
                    display: none;
                }
                -ms-overflow-style: none;
                scrollbar-width: none;

                /* Elegant selection */
                ::selection {
                    background: rgba(59, 130, 246, 0.2);
                    color: white;
                }

                /* Smooth focus outline removal */
                *:focus {
                    outline: none;
                }

                /* Keyboard key styling */
                kbd {
                    font-family: 'Inter', monospace;
                    background: rgba(100, 116, 139, 0.3);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                }

                /* Mobile responsiveness */
                @media (max-width: 640px) {
                    .container-padding {
                        padding: 10px;
                    }
                }

                /* Very small screens */
                @media (max-width: 360px) {
                    .container-padding {
                        padding: 8px;
                    }
                }

                /* Prevent zoom on input focus for mobile */
                @media (max-width: 768px) {
                    input {
                        font-size: 16px; /* Prevents zoom on iOS */
                    }
                }
            `}</style>
        </div>
    );
}