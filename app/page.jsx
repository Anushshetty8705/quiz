"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 overflow-hidden">
      
      {/* BACKGROUND AMBIENCE */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* LOGO BADGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
        >
          <Zap size={14} className="text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Next Generation Proctoring
          </span>
        </motion.div>

        {/* HERO TEXT */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl sm:text-7xl md:text-8xl font-extrabold mb-8 text-center tracking-tighter"
        >
          Master your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40">
            Assessments.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg sm:text-xl text-center max-w-2xl mb-12 leading-relaxed"
        >
          A secure, real-time quiz platform designed for modern educators. 
          Monitor students, track performance, and prevent malpractice—all in one glass-dark interface.
        </motion.p>

        {/* ACTIONS */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <button className="group relative w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5">
              Teacher Portal
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>

          <Link href="/join-quiz" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-all backdrop-blur-sm">
              <ShieldCheck size={18} className="text-indigo-400" />
              Join as Student
            </button>
          </Link>
        </motion.div>

        {/* FEATURE TAGS */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 text-slate-500"
        >
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-medium uppercase tracking-widest">Live Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
            <span className="text-xs font-medium uppercase tracking-widest">Anti-Cheat</span>
          </div>
          <div className="flex items-center gap-2 hidden md:flex">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium uppercase tracking-widest">Instant Results</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}