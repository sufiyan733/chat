"use client";

import { useState, useRef, useEffect } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import { useAppData } from "@/context/AppContext";
import Loading from "./loading";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import * as THREE from "three";
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
  const [toastText, setToastText] = useState("");

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

  // Enter key: submit when all digits present
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && code.every(d => d !== "")) handleSubmit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [code]); // eslint-disable-line

  /**
   * THREE.JS: exact model copied from login page
   * - particle field (color + size attributes)
   * - floating torus and sphere with similar materials/positions
   * - camera, mouse parallax, resize handling, cleanup
   */
  useEffect(() => {
    if (!canvasRef.current) return;

    let frameId: number;
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Premium particle field (copied)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1200;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const sizeArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const i3 = i * 3;
      posArray[i3] = (Math.random() - 0.5) * 50;
      posArray[i3 + 1] = (Math.random() - 0.5) * 50;
      posArray[i3 + 2] = (Math.random() - 0.5) * 50;

      const color = new THREE.Color();
      color.setHSL(0.55 + Math.random() * 0.1, 0.7, 0.6);
      colorArray[i3] = color.r;
      colorArray[i3 + 1] = color.g;
      colorArray[i3 + 2] = color.b;

      sizeArray[i] = Math.random() * 2 + 0.5;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Luxury floating torus (copied)
    const torusGeometry = new THREE.TorusGeometry(2, 0.6, 16, 100);
    const torusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3b82f6,
      transmission: 0.95,
      opacity: 0.15,
      transparent: true,
      roughness: 0.1,
      metalness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide
    });
    const torus = new THREE.Mesh(torusGeometry, torusMaterial);
    torus.position.set(-5, 2, -5);
    scene.add(torus);

    // Luxury sphere (copied)
    const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      transmission: 0.98,
      opacity: 0.1,
      transparent: true,
      roughness: 0,
      metalness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(6, -3, -8);
    scene.add(sphere);

    let mouseXPos = 0;
    let mouseYPos = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseXPos = (event.clientX / window.innerWidth) * 2 - 1;
      mouseYPos = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      particlesMesh.rotation.y = elapsedTime * 0.05;
      particlesMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.1;

      torus.rotation.x = elapsedTime * 0.2;
      torus.rotation.y = elapsedTime * 0.3;
      torus.position.y = 2 + Math.sin(elapsedTime * 0.5) * 0.5;

      sphere.rotation.y = -elapsedTime * 0.15;
      sphere.position.y = -3 + Math.cos(elapsedTime * 0.7) * 0.3;

      camera.position.x += (mouseXPos * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouseYPos * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);

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
      // Dispose geometries/materials
      try { particlesGeometry.dispose(); } catch {}
      try { particlesMaterial.dispose(); } catch {}
      try { torusGeometry.dispose(); } catch {}
      try { torusMaterial.dispose(); } catch {}
      try { sphereGeometry.dispose(); } catch {}
      try { sphereMaterial.dispose(); } catch {}
      scene.clear();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) setTimeout(() => inputRefs.current[0]?.focus(), 260);
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newCode.every(d => d !== "") && index === 5) handleSubmit();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
    } else if (e.key === "Enter" && code.every(d => d !== "")) {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").slice(0, 6);
      const padded = [...newCode, ...Array(6 - newCode.length).fill("")];
      setCode(padded);
      const last = Math.min(newCode.length - 1, 5);
      setTimeout(() => inputRefs.current[last]?.focus(), 0);
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
        otp: verificationCode,
      });

      Cookies.set("token", data.token, { expires: 15, secure: false, path: "/" });

      setSuccess(true);
      setUser(data.user);
      setIsAuth(true);

      setToastText("Access granted — redirecting");
      setShowToast(true);

      setTimeout(() => {
        fetchChats();
        fetchUsers();
        router.push("/chat");
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid verification code. Please try again.");
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
      setToastText("Verification code sent");
      setShowToast(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  if (userLoading) return <Loading />;
  if (isAuth) redirect("/chat");

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative"
      onMouseMove={(e) => {
        mouseX.set(e.clientX / window.innerWidth);
        mouseY.set(e.clientY / window.innerHeight);
      }}
      style={{ padding: 10 }}
    >
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Floating accents */}
      <motion.div
        className="absolute -left-24 -top-24 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(6,182,212,0.06))", filter: "blur(120px)" }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.06))", filter: "blur(100px)" }}
        animate={{ x: [0, -30, 0], y: [0, -20, 0], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -18, scale: 0.96, filter: "blur(6px)" }}
            transition={{ duration: 0.32 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
          >
            <div className="bg-white/6 backdrop-blur-2xl rounded-2xl p-3 border border-white/20 shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-100 font-semibold text-sm truncate">{success ? "Access Granted" : toastText || "Notification"}</p>
                  <p className="text-slate-300 text-xs truncate">{success ? "Welcome back" : `Check ${email}`}</p>
                </div>
              </div>
              <motion.div
                className="absolute bottom-0 left-0 h-[3px] rounded-b-md"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 2.2, ease: "linear" }}
                style={{ background: "linear-gradient(90deg,#22c1c3,#06b6d4)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card */}
      <motion.div
        className="relative z-10 w-full max-w-xs sm:max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ rotateX: rotateX as any, rotateY: rotateY as any }}
        ref={formRef}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-4 relative rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-400/6 blur-sm" />
          </div>

          <h1 className="text-2xl sm:text-3xl text-white font-light mb-1 leading-tight">
            Welcome to
            <div className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
              ChatApp
            </div>
          </h1>

          <p className="text-white/60 text-sm mt-1">Enter the 6-digit code we sent to</p>
          <p className="text-cyan-300 text-sm truncate mt-1">{email}</p>
        </div>

        {/* Card */}
        <motion.div
          className="bg-white/4 backdrop-blur-3xl rounded-3xl border border-white/10 p-4 sm:p-5 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.06) 0%, transparent 30%),
                              radial-gradient(circle at 75% 75%, rgba(6,182,212,0.04) 0%, transparent 30%)`
          }} />

          <label className="block text-xs text-slate-300 uppercase tracking-wide text-center mb-3">Verification Code</label>
          <div className="flex justify-center gap-2 mb-3" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <motion.input
                key={i}
                ref={setInputRef(i)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-10 h-10 sm:w-12 sm:h-12 text-center text-white text-sm sm:text-base font-medium bg-black/30 border border-slate-600/40 rounded-lg focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/20 outline-none transition"
                disabled={loading}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-3 rounded-md bg-red-600/10 border border-red-600/20 px-3 py-2 text-xs text-red-200"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleSubmit}
            disabled={loading || code.some(d => d === "")}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 px-3 py-3 text-white font-medium disabled:opacity-60 mb-3 relative overflow-hidden"
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: 0.985 }}
          >
            <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent transform -translate-x-[150%] transition-transform duration-700" />
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v4m0 12v4m8-10h-4M6 12H2" />
                  </motion.svg>
                  <span className="text-sm">Verifying…</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Verify & Continue</span>
                </>
              )}
            </div>
          </motion.button>

          <div className="text-center border-t border-slate-700/20 pt-3">
            <p className="text-slate-400 text-xs mb-2">Didn't receive the code?</p>

            <motion.button
              onClick={handleResendCode}
              disabled={countdown > 0 || resendLoading}
              className="text-cyan-300 hover:text-white text-xs font-medium disabled:opacity-40 flex items-center justify-center gap-2 mx-auto"
            >
              {resendLoading ? (
                <>
                  <motion.svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581" />
                  </motion.svg>
                  <span>Sending…</span>
                </>
              ) : countdown > 0 ? (
                <>
                  <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                  <span>{countdown}s</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8 8 0 004.582 9" />
                  </svg>
                  <span>Resend code</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
        html, body, #__next { height: 100%; }
        body {
          margin: 0;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          background: linear-gradient(180deg, #020617 0%, #001021 100%);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow: hidden;
        }
        ::-webkit-scrollbar { display: none; }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-text-fill-color: white;
          -webkit-box-shadow: 0 0 0px 1000px rgba(255,255,255,0.02) inset;
        }
        @media (max-width: 768px) {
          input { font-size: 16px; }
        }
      `}</style>
    </div>
  );
}
