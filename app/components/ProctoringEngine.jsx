"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, ShieldAlert, UserCheck, AlertOctagon, CameraOff } from "lucide-react";
import toast from "react-hot-toast";

export default function ProctoringEngine({ onLock, onCameraError }) {
  const videoRef = useRef(null);
  const [warningCount, setWarningCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentViolation, setCurrentViolation] = useState(null);
  const lastWarningTime = useRef(0);
  const [isCooldown, setIsCooldown] = useState(false);
  const lastViolationRef = useRef(null);

  useEffect(() => {
    const initMP = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numFaces: 2,
        });
        setFaceLandmarker(landmarker);
      } catch (e) {
        console.error("AI Initialization Error:", e);
      }
    };
    initMP();

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => {
          console.error("Camera error:", err);
          onCameraError(true); // Signal parent to block quiz
          toast.error("Camera access denied.");
        });
    } else {
      onCameraError(true);
    }
  }, [onCameraError]);

  useEffect(() => {
    if (!faceLandmarker || isLocked) return;
    let requestID;
    const detect = async () => {
      if (videoRef.current?.readyState >= 2) {
        const results = faceLandmarker.detectForVideo(videoRef.current, performance.now());
        let violationDetected = null;
        if (results.faceLandmarks) {
          if (results.faceLandmarks.length > 1) {
            violationDetected = "Multiple Faces Detected";
          } else if (results.faceLandmarks[0]) {
            const landmarks = results.faceLandmarks[0];
            const nose = landmarks[1], lEye = landmarks[33], rEye = landmarks[263], topLip = landmarks[13], bottomLip = landmarks[14];
            const yaw = (nose.x - lEye.x) / (rEye.x - lEye.x);
            const pitch = nose.y - (lEye.y + rEye.y) / 2;
            const mouthOpen = Math.abs(topLip.y - bottomLip.y);
            if (yaw < 0.25) violationDetected = "Turning Right Detected";
            else if (yaw > 0.75) violationDetected = "Turning Left Detected";
            else if (pitch > 0.12) violationDetected = "Looking Down Detected";
            else if (mouthOpen > 0.05) violationDetected = "Talking Detected";
          } else {
            violationDetected = "Face Not Visible";
          }
        }
        setCurrentViolation(violationDetected);
        if (violationDetected && (lastViolationRef.current !== violationDetected || !isCooldown)) {
          lastViolationRef.current = violationDetected;
          triggerWarning(violationDetected);
        }
      }
      requestID = requestAnimationFrame(detect);
    };
    detect();
    return () => cancelAnimationFrame(requestID);
  }, [faceLandmarker, isLocked, isCooldown]);

  const triggerWarning = (reason) => {
    const now = Date.now();
    if (now - lastWarningTime.current < 5000) return;
    lastWarningTime.current = now;
    setIsCooldown(true);
    setTimeout(() => { setIsCooldown(false); lastViolationRef.current = null; }, 5000);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setWarningCount((prev) => {
      const newCount = prev + 1;
      toast.custom((t) => (
        <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex border-l-[10px] border-red-600`}>
          <div className="flex-1 p-4 flex items-start">
            <AlertOctagon className="h-10 w-10 text-red-600 shrink-0" />
            <div className="ml-4">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Security Warning {newCount}/3</p>
              <p className="mt-1 text-lg font-bold text-gray-900 leading-tight">{reason}</p>
            </div>
          </div>
        </div>
      ), { duration: 3000, position: "top-center" });
      if (newCount >= 3) {
        setIsLocked(true);
        setTimeout(() => onLock(reason), 1200);
        return 3;
      }
      return newCount;
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-black/85 backdrop-blur-2xl p-3 rounded-2xl border border-white/10 shadow-2xl">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">AI Proctoring</span>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ${warningCount >= i ? "bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse" : "bg-white/10"}`} />
        ))}
      </div>
      <motion.div layout animate={{ width: isMinimized ? 70 : 180, height: isMinimized ? 70 : 180 }} className={`pointer-events-auto relative rounded-[2rem] overflow-hidden border-4 shadow-2xl bg-black transition-all duration-300 ${currentViolation ? "border-red-600 scale-[1.02]" : isCooldown ? "border-amber-500" : "border-emerald-500/40"}`}>
        {!isMinimized ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1] opacity-60 grayscale hover:grayscale-0 transition-all duration-700" />
            <AnimatePresence>
              {currentViolation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-red-600/20 flex items-center justify-center px-2 text-center">
                  <p className="text-[10px] font-black text-white leading-tight uppercase">{currentViolation}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setIsMinimized(true)} className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white/50 hover:text-white transition"><Minimize2 size={14} /></button>
            {!currentViolation && <div className="absolute top-2 left-2 text-emerald-500/80"><UserCheck size={16} /></div>}
          </>
        ) : (
          <button onClick={() => setIsMinimized(false)} className="w-full h-full flex flex-col items-center justify-center gap-1 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition">
            <ShieldAlert size={20} className={warningCount > 0 ? "text-red-500 animate-bounce" : ""} />
            <span className="text-[10px] font-bold">{warningCount}/3</span>
          </button>
        )}
      </motion.div>
    </div>
  );
}