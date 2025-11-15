// "use client";
// import { useState, FormEvent, useEffect, useRef } from "react";
// import { redirect, useRouter } from "next/navigation";
// import axios from "axios";
// import { useAppData } from "@/context/AppContext";
// import Loading from "@/Components/loading";
// import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
// import * as THREE from 'three';
// import { userr_service } from "../../../url";

// export default function LoginPage() {
//     const { loading: userLoading, isAuth } = useAppData();
//     const router = useRouter();
//     const [email, setEmail] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [showToast, setShowToast] = useState(false);
//     const containerRef = useRef<HTMLDivElement>(null);
//     const canvasRef = useRef<HTMLCanvasElement>(null);

//     // Premium mouse tracking
//     const mouseX = useMotionValue(0);
//     const mouseY = useMotionValue(0);
//     const smoothX = useSpring(mouseX, { damping: 25, stiffness: 300 });
//     const smoothY = useSpring(mouseY, { damping: 25, stiffness: 300 });

//     const rotateX = useTransform(smoothY, [0, 1], [2, -2]);
//     const rotateY = useTransform(smoothX, [0, 1], [-2, 2]);

//     // Premium Three.js Background
//     useEffect(() => {
//         if (!canvasRef.current) return;

//         let frameId: number;
//         const scene = new THREE.Scene();
//         const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//         const renderer = new THREE.WebGLRenderer({ 
//             canvas: canvasRef.current, 
//             alpha: true,
//             antialias: true
//         });

//         renderer.setSize(window.innerWidth, window.innerHeight);
//         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//         renderer.setClearColor(0x000000, 0);

//         // Create premium floating particles
//         const particlesGeometry = new THREE.BufferGeometry();
//         const particlesCount = 600;

//         const posArray = new Float32Array(particlesCount * 3);
//         const colorArray = new Float32Array(particlesCount * 3);

//         for (let i = 0; i < particlesCount * 3; i++) {
//             posArray[i] = (Math.random() - 0.5) * 40;
//             colorArray[i] = Math.random() * 0.2 + 0.8; // Consistent white-blue tones
//         }

//         particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
//         particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

//         const particlesMaterial = new THREE.PointsMaterial({
//             size: 0.03,
//             vertexColors: true,
//             transparent: true,
//             opacity: 0.3,
//             blending: THREE.AdditiveBlending,
//             sizeAttenuation: true
//         });

//         const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
//         scene.add(particlesMesh);

//         // Add floating geometric shapes with premium materials
//         const geometries = [
//             new THREE.OctahedronGeometry(0.8, 1),
//             new THREE.IcosahedronGeometry(0.6, 1),
//             new THREE.DodecahedronGeometry(0.5, 0)
//         ];

//         const shapes: THREE.Mesh[] = [];
//         const shapeCount = 3;

//         for (let i = 0; i < shapeCount; i++) {
//             const geometry = geometries[Math.floor(Math.random() * geometries.length)];
//             const material = new THREE.MeshPhysicalMaterial({
//                 color: 0x3b82f6,
//                 transmission: 0.98,
//                 opacity: 0.08,
//                 transparent: true,
//                 roughness: 0,
//                 metalness: 0.2,
//                 clearcoat: 1,
//                 clearcoatRoughness: 0
//             });

//             const shape = new THREE.Mesh(geometry, material);
//             shape.position.set(
//                 (Math.random() - 0.5) * 12,
//                 (Math.random() - 0.5) * 12,
//                 (Math.random() - 0.5) * 8
//             );
//             shape.scale.setScalar(Math.random() * 0.2 + 0.15);
//             scene.add(shape);
//             shapes.push(shape);
//         }

//         camera.position.z = 10;

//         const handleMouseMove = (event: MouseEvent) => {
//             mouseX.set(event.clientX / window.innerWidth);
//             mouseY.set(event.clientY / window.innerHeight);

//             particlesMesh.rotation.x = event.clientY * 0.00003;
//             particlesMesh.rotation.y = event.clientX * 0.00003;
//         };

//         window.addEventListener('mousemove', handleMouseMove);

//         const animate = () => {
//             frameId = requestAnimationFrame(animate);

//             particlesMesh.rotation.y += 0.0003;
//             shapes.forEach((shape, index) => {
//                 shape.rotation.x += 0.001;
//                 shape.rotation.y += 0.0005;
//                 shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
//             });

//             renderer.render(scene, camera);
//         };

//         animate();

//         const handleResize = () => {
//             camera.aspect = window.innerWidth / window.innerHeight;
//             camera.updateProjectionMatrix();
//             renderer.setSize(window.innerWidth, window.innerHeight);
//         };

//         window.addEventListener('resize', handleResize);

//         return () => {
//             window.removeEventListener('mousemove', handleMouseMove);
//             window.removeEventListener('resize', handleResize);
//             cancelAnimationFrame(frameId);
//             renderer.dispose();
//         };
//     }, []);

//     async function handleSubmit(e: FormEvent) {
//         e.preventDefault();
//         setError(null);

//         const trimmed = email.trim().toLowerCase();
//         if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
//             setError("Please enter a valid email address.");
//             return;
//         }

//         setLoading(true);
//         try {
//             await axios.post(`${userr_service}/api/v1/login`, { email: trimmed });
//             setShowToast(true);
//             setTimeout(() => {
//                 router.push(`/verify?email=${trimmed}`);
//             }, 2000);
//         } catch (err: any) {
//             if (axios.isAxiosError(err)) {
//                 setError(err.response?.data?.message || "Failed to send verification code.");
//             } else {
//                 setError("An unexpected error occurred. Please try again.");
//             }
//         } finally {
//             setLoading(false);
//         }
//     }

//     useEffect(() => {
//         if (showToast) {
//             const timer = setTimeout(() => {
//                 setShowToast(false);
//             }, 2000);
//             return () => clearTimeout(timer);
//         }
//     }, [showToast]);

//     if (userLoading) return <Loading />;
//     if (isAuth) return redirect("/chat");

//     return (
//         <div 
//             ref={containerRef}
//             className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative"
//             onMouseMove={(e) => {
//                 mouseX.set(e.clientX / window.innerWidth);
//                 mouseY.set(e.clientY / window.innerHeight);
//             }}
//         >
//             {/* Three.js Canvas Background */}
//             <canvas 
//                 ref={canvasRef} 
//                 className="absolute inset-0 w-full h-full opacity-30"
//             />

//             {/* Premium Light Orbs */}
//             <div className="absolute inset-0 overflow-hidden">
//                 <motion.div
//                     className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
//                     animate={{
//                         scale: [1, 1.1, 1],
//                         opacity: [0.1, 0.15, 0.1],
//                     }}
//                     transition={{
//                         duration: 8,
//                         repeat: Infinity,
//                         ease: "easeInOut"
//                     }}
//                 />
//                 <motion.div
//                     className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"
//                     animate={{
//                         scale: [1.1, 1, 1.1],
//                         opacity: [0.08, 0.12, 0.08],
//                     }}
//                     transition={{
//                         duration: 6,
//                         repeat: Infinity,
//                         ease: "easeInOut",
//                         delay: 2
//                     }}
//                 />
//             </div>

//             {/* Animated Grid Pattern */}
//             <div className="absolute inset-0 opacity-5">
//                 <div className="w-full h-full" style={{
//                     backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
//                                     linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
//                     backgroundSize: '50px 50px'
//                 }} />
//             </div>

//             {/* Toast Notification - Ultra Premium */}
//             <AnimatePresence>
//                 {showToast && (
//                     <motion.div
//                         className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm"
//                         initial={{ opacity: 0, y: -20, scale: 0.95 }}
//                         animate={{ opacity: 1, y: 0, scale: 1 }}
//                         exit={{ opacity: 0, y: -20, scale: 0.95 }}
//                         transition={{ type: "spring", damping: 25, stiffness: 300 }}
//                     >
//                         <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 relative overflow-hidden">
//                             <div className="flex items-center space-x-3">
//                                 <motion.div
//                                     className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
//                                     initial={{ scale: 0, rotate: -180 }}
//                                     animate={{ scale: 1, rotate: 0 }}
//                                     transition={{ delay: 0.2, type: "spring" }}
//                                 >
//                                     <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                     </svg>
//                                 </motion.div>
//                                 <div className="flex-1">
//                                     <p className="text-slate-900 font-semibold text-sm">
//                                         Verification sent
//                                     </p>
//                                     <p className="text-slate-600 text-xs">
//                                         Check {email}
//                                     </p>
//                                 </div>
//                             </div>
//                             <motion.div 
//                                 className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500"
//                                 initial={{ width: "100%" }}
//                                 animate={{ width: "0%" }}
//                                 transition={{ duration: 2, ease: "linear" }}
//                             />
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             {/* Main Content Container */}
//             <motion.div 
//                 className="w-full max-w-sm relative z-10"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, ease: "easeOut" }}
//                 style={{
//                     rotateX,
//                     rotateY,
//                 }}
//             >
//                 {/* Premium Header */}
//                 <motion.div 
//                     className="text-center mb-12"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2, duration: 0.6 }}
//                 >
//                     <motion.div
//                         className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-2xl border border-slate-700/50 relative"
//                         animate={{ 
//                             y: [0, -8, 0],
//                         }}
//                         transition={{
//                             duration: 6,
//                             repeat: Infinity,
//                             ease: "easeInOut"
//                         }}
//                     >
//                         {/* Premium Icon Glow */}
//                         <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-md" />
//                         <svg className="w-7 h-7 text-blue-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                         </svg>
//                     </motion.div>
                    
//                     <motion.h1 
//                         className="text-4xl font-light text-white mb-2 tracking-tight"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.3 }}
//                     >
//                         Welcome to{" "}
//                         <span className="font-semibold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
//                             ChatApp
//                         </span>
//                     </motion.h1>
//                 </motion.div>

//                 {/* Ultra Premium Login Card */}
//                 <motion.div
//                     className="bg-gradient-to-br -mb-8 from-white/5 to-white/3 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
//                     initial={{ opacity: 0, scale: 0.85 }}
//                     animate={{ opacity: 1, scale: 0.9 }}
//                     transition={{ delay: 0.3, duration: 0.7 }}
//                     whileHover={{ 
//                         y: -1,
//                         transition: { type: "spring", stiffness: 400 }
//                     }}
//                 >
//                     {/* Premium Background Pattern */}
//                     <div className="absolute inset-0 opacity-10">
//                         <div className="absolute inset-0" style={{
//                             backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
//                                             radial-gradient(circle at 75% 75%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
//                         }} />
//                     </div>

//                     {/* Animated Border Glow */}
//                     <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />

//                     <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
//                         <motion.div 
//                             className="space-y-2"
//                             initial={{ opacity: 0, x: -10 }}
//                             animate={{ opacity: 1, x: 0 }}
//                             transition={{ delay: 0.5 }}
//                         >
//                             <label className="block">
//                                 <span className="block mb-3 text-sm font-medium text-slate-300 uppercase tracking-widest">
//                                     Email Address
//                                 </span>
//                                 <motion.input
//                                     type="email"
//                                     name="email"
//                                     required
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     placeholder="enter your email"
//                                     className="w-full rounded-xl bg-black/20 border border-slate-600/30 px-4 py-4 text-white placeholder-slate-400/60 outline-none transition-all duration-200 focus:bg-black/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-light"
//                                     autoComplete="email"
//                                     whileFocus={{
//                                         scale: 1.01,
//                                     }}
//                                 />
//                             </label>
//                         </motion.div>

//                         <AnimatePresence>
//                             {error && (
//                                 <motion.div
//                                     className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 backdrop-blur-sm"
//                                     initial={{ opacity: 0, height: 0 }}
//                                     animate={{ opacity: 1, height: "auto" }}
//                                     exit={{ opacity: 0, height: 0 }}
//                                     transition={{ duration: 0.3 }}
//                                 >
//                                     <p className="text-sm text-red-200 flex items-center font-light">
//                                         <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         {error}
//                                     </p>
//                                 </motion.div>
//                             )}
//                         </AnimatePresence>

//                         {/* Premium Button */}
//                         <motion.button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl relative overflow-hidden group"
//                             whileHover={{ 
//                                 scale: loading ? 1 : 1.01,
//                             }}
//                             whileTap={{ scale: 0.99 }}
//                         >
//                             {/* Premium shine effect */}
//                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 transform translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000" />
                            
//                             <span className="flex items-center justify-center space-x-2 relative z-10">
//                                 {loading ? (
//                                     <>
//                                         <motion.svg 
//                                             className="w-5 h-5" 
//                                             fill="none" 
//                                             stroke="currentColor" 
//                                             viewBox="0 0 24 24"
//                                             animate={{ rotate: 360 }}
//                                             transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
//                                         >
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
//                                         </motion.svg>
//                                         <span className="font-light">Sending Code...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                                         </svg>
//                                         <span className="font-light">Send Verification Code</span>
//                                     </>
//                                 )}
//                             </span>
//                         </motion.button>
//                     </form>

//                     {/* Premium Security Features */}
//                     <motion.div 
//                         className="mt-2 pt-6 border-t border-slate-700/30"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         transition={{ delay: 0.8 }}
//                     >
//                         <div className="grid grid-cols-2 gap-3 text-slate-400">
//                             <motion.div 
//                                 className="flex items-center space-x-2 text-xs p-3 rounded-lg bg-blue-500/5 border border-blue-500/10"
//                                 whileHover={{ 
//                                     scale: 1.02,
//                                     backgroundColor: "rgba(59, 130, 246, 0.1)",
//                                     transition: { type: "spring", stiffness: 400 }
//                                 }}
//                             >
//                                 <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                                 </svg>
//                                 <span className="text-blue-300 font-light">Encrypted</span>
//                             </motion.div>
//                             <motion.div 
//                                 className="flex items-center space-x-2 text-xs p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10"
//                                 whileHover={{ 
//                                     scale: 1.02,
//                                     backgroundColor: "rgba(6, 182, 212, 0.1)",
//                                     transition: { type: "spring", stiffness: 400 }
//                                 }}
//                             >
//                                 <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                                 </svg>
//                                 <span className="text-cyan-300 font-light">Secure</span>
//                             </motion.div>
//                         </div>
//                     </motion.div>
//                 </motion.div>

//                 {/* Premium Micro-Interaction Hints */}
//                 <motion.div 
//                     className="text-center mt-6"
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 1.2 }}
//                 >
                    
//                 </motion.div>
//             </motion.div>

//             <style jsx global>{`
//                 @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
                
//                 body {
//                     overflow: hidden;
//                     margin: 0;
//                     padding: 0;
//                     font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//                     font-weight: 300;
//                 }

//                 /* Premium scrollbar hiding */
//                 ::-webkit-scrollbar {
//                     display: none;
//                 }
//                 -ms-overflow-style: none;
//                 scrollbar-width: none;

//                 /* Elegant selection */
//                 ::selection {
//                     background: rgba(59, 130, 246, 0.2);
//                     color: white;
//                 }

//                 /* Smooth focus outline removal */
//                 *:focus {
//                     outline: none;
//                 }

//                 /* Premium smooth scrolling */
//                 html {
//                     scroll-behavior: smooth;
//                 }
//             `}</style>
//         </div>
//     );
// }
"use client";

import React, { useEffect, useRef, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as THREE from "three";
import axios from "axios";
import { userr_service } from "../../../url";

export default function PremiumLoginPage(){
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { damping: 30, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 30, stiffness: 200 });
  const cardRotateX = useTransform(smoothY, [0, 1], [2.5, -2.5]);
  const cardRotateY = useTransform(smoothX, [0, 1], [-3.5, 3.5]);

  /* ---------------- THREE.JS LIGHT BACKGROUND ---------------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let frameId = 0;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);

    const resize = () => {
      const r = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / r.height;
      camera.updateProjectionMatrix();
    };
    resize();

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const COUNT = 420;
    const pos = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const tmp = new THREE.Color();

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 40;
      pos[i3 + 1] = (Math.random() - 0.5) * 30;
      pos[i3 + 2] = (Math.random() - 0.5) * 40;
      tmp.setHSL(0.55 + Math.random() * 0.1, 0.6, 0.55);
      col[i3] = tmp.r; col[i3 + 1] = tmp.g; col[i3 + 2] = tmp.b;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });

    const pts = new THREE.Points(g, m);
    scene.add(pts);

    camera.position.z = 14;

    let mx = 0, my = 0;
    const onMove = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width) * 2 - 1;
      my = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    container.addEventListener("pointermove", onMove);

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const clock = new THREE.Clock();
    const loop = () => {
      frameId = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      pts.rotation.y = t * 0.03;
      pts.rotation.x = Math.sin(t * 0.2) * 0.05;
      camera.position.x += (mx * 1.4 - camera.position.x) * 0.03;
      camera.position.y += (my * 1.4 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      g.dispose(); m.dispose();
      scene.clear(); renderer.dispose();
    };
  }, []);

  /* ---------------- FORM ---------------- */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const t = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) {
      setError("Enter a valid email");
      return;
    }

    setLoading(true);
    
        try {
            await axios.post(`${userr_service}/api/v1/login`, { email: t });
            setShowToast(true);
            setTimeout(() => {
                router.push(`/verify?email=${t}`);
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
    setTimeout(() => {
      setLoading(false);
      setToastText("Code sent to your email");
      setShowToast(true);
      setTimeout(() => {
        router.push(`/verify?email=${t}`);
      }, 900);
    }, 900);
  }

  useEffect(() => {
    if (!showToast) return;
    const id = setTimeout(() => setShowToast(false), 2500);
    return () => clearTimeout(id);
  }, [showToast]);


  return (
    <div
      ref={containerRef}
      className="h-screen w-screen bg-black flex items-center justify-center p-6 relative overflow-hidden"
      onMouseMove={(e) => {
        mouseX.set(e.clientX / window.innerWidth);
        mouseY.set(e.clientY / window.innerHeight);
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* ----------- CARD (matched to Verify theme) ----------- */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <motion.div
          className="w-[360px] max-w-[92vw] rounded-3xl bg-white/4 backdrop-blur-3xl border border-white/10 shadow-2xl p-5 sm:p-6 flex flex-col items-center gap-4 relative overflow-hidden"
          style={{ transformStyle: "preserve-3d", rotateX: cardRotateX as any, rotateY: cardRotateY as any }}
          whileHover={{ translateY: -6 }}
        >
          {/* radial accents (like verify card) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.06) 0%, transparent 30%),
                              radial-gradient(circle at 75% 75%, rgba(6,182,212,0.04) 0%, transparent 30%)`
          }} />

          {/* LOGO (above title) */}
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg z-10"
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-400/6 blur-sm" />
          </motion.div>

          {/* TITLE (larger, centered like verify page) */}
          <h1 className="text-white text-3xl sm:text-3xl font-semibold tracking-tight text-center leading-tight z-10">
            Welcome to
            <div className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 font-extrabold mt-1">
              ChatApp
            </div>
          </h1>

          {/* FORM (compact: input + button below, button width same as input) */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col z-10">
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/12 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20 transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white text-sm font-semibold py-3 h-11 flex items-center justify-center disabled:opacity-60"
            >
              {loading ? "Sending…" : "Send verification code"}
            </button>

            {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
          </form>
        </motion.div>
      </motion.div>

      {/* ----------- PREMIUM TOAST (matching verify theme) ----------- */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(6px)" }}
            transition={{ duration: 0.35 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="relative bg-white/6 backdrop-blur-2xl border border-white/20 rounded-2xl px-6 py-4 shadow-[0_0_40px_rgba(6,182,212,0.25)] flex items-center gap-4 overflow-hidden">
              
              {/* ICON */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              {/* TEXT */}
              <div className="text-white">
                <p className="font-medium text-base">{toastText}</p>
                <p className="text-white/60 text-sm">Check {email}</p>
              </div>

              {/* PROGRESS BAR */}
              <motion.div
                className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-green-400 to-emerald-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 2.5, ease: "linear" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOLLOW GLOW */}
      <motion.div
        className="fixed pointer-events-none rounded-full"
        style={{
          left: smoothX,
          top: smoothY,
          x: "-50%", y: "-50%",
          width: 220, height: 220,
          background: "radial-gradient(circle, rgba(6,182,212,0.06), transparent 40%)",
          filter: "blur(36px)"
        }}
      />

      {/* GLOBAL STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        body { margin: 0; font-family: Inter, sans-serif; background: linear-gradient(180deg, #020617 0%, #001021 100%); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
