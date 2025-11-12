"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { redirect, useRouter } from "next/navigation";
import axios from "axios";
import { useAppData } from "@/context/AppContext";
import Loading from "@/Components/loading";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as THREE from "three";
import { userr_service } from "../../../url";




export default function LoginPage() {
  const { loading: userLoading, isAuth } = useAppData();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Motion values for 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 25, stiffness: 300 });
  const smoothY = useSpring(mouseY, { damping: 25, stiffness: 300 });
  const rotateX = useTransform(smoothY, [0, 1], [2, -2]);
  const rotateY = useTransform(smoothX, [0, 1], [-2, 2]);

  // Premium Three.js Background
  useEffect(() => {
    if (!canvasRef.current) return;

    let frameId: number;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Floating particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 600;

    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 40;
      colorArray[i] = Math.random() * 0.2 + 0.8;
    }

    particlesGeometry.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Floating geometric shapes
    const geometries = [
      new THREE.OctahedronGeometry(0.8, 1),
      new THREE.IcosahedronGeometry(0.6, 1),
      new THREE.DodecahedronGeometry(0.5, 0),
    ];

    const shapes: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6,
        transmission: 0.98,
        opacity: 0.08,
        transparent: true,
        roughness: 0,
        metalness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0,
      });

      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8
      );
      shape.scale.setScalar(Math.random() * 0.2 + 0.15);
      scene.add(shape);
      shapes.push(shape);
    }

    camera.position.z = 10;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX / window.innerWidth);
      mouseY.set(event.clientY / window.innerHeight);
      particlesMesh.rotation.x = event.clientY * 0.00003;
      particlesMesh.rotation.y = event.clientX * 0.00003;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      particlesMesh.rotation.y += 0.0003;
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.001;
        shape.rotation.y += 0.0005;
        shape.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
      });
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  // Form submission
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
        console.log(userr_service,"us");
      await axios.post(`${userr_service}/api/v1/login`, { email: trimmed });
      setShowToast(true);
      setTimeout(() => router.push(`/verify?email=${trimmed}`), 2000);
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
      const timer = setTimeout(() => setShowToast(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  if (userLoading) return <Loading />;
  if (isAuth) return redirect("/chat");

  return (
    <div
      ref={containerRef}
      className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-4 overflow-hidden relative"
      onMouseMove={(e) => {
        mouseX.set(e.clientX / window.innerWidth);
        mouseY.set(e.clientY / window.innerHeight);
      }}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 relative">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <div className="flex-1">
                  <p className="text-slate-900 font-semibold text-sm">Verification sent</p>
                  <p className="text-slate-600 text-xs">Check {email}</p>
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

      {/* Main Card */}
      <motion.div
        className="w-full max-w-sm relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          rotateX,
          rotateY,
        }}
      >
        <motion.div
          className="bg-gradient-to-br from-white/5 to-white/3 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <label className="block space-y-2">
              <span className="block text-sm font-medium text-slate-300 uppercase tracking-widest">
                Email Address
              </span>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter your email"
                className="w-full rounded-xl bg-black/20 border border-slate-600/30 px-4 py-4 text-white placeholder-slate-400/60 outline-none transition-all duration-200 focus:bg-black/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 backdrop-blur-sm font-light"
                autoComplete="email"
              />
            </label>

            {error && (
              <motion.div
                className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 backdrop-blur-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-red-200 flex items-center font-light">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl relative overflow-hidden group"
              whileHover={{
                scale: loading ? 1 : 1.01,
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 transform translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000" />

              <span className="flex items-center justify-center space-x-2 relative z-10">
                {loading ? (
                  <>
                    <motion.svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
                    </motion.svg>
                    <span className="font-light">Sending Code...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
                    </svg>
                    <span className="font-light">Send Verification Code</span>
                  </>
                )}
              </span>
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        body {
          overflow: hidden;
          margin: 0;
          font-family: "Inter", sans-serif;
          background: #020617;
        }
        ::-webkit-scrollbar {
          display: none;
        }
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}
