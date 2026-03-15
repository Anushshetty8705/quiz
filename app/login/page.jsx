"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, ShieldCheck } from "lucide-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#050505] relative overflow-hidden">
      
      {/* AUTH BACKGROUND GLOWS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* BRANDING LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/40 mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Instructor Portal</h1>
          <p className="text-slate-500 text-sm mt-1">Access your quiz management suite</p>
        </div>

        {/* GLASS CARD */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          
          {/* PREMIUM TAB SWITCHER */}
          <div className="relative bg-black/40 rounded-2xl p-1.5 flex mb-8 border border-white/5">
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20"
              style={{ left: tab === "login" ? "6px" : "calc(50%)" }}
            />

            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 z-10 font-bold text-sm flex items-center justify-center gap-2 transition-colors duration-300 ${
                tab === "login" ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <LogIn size={16} /> Login
            </button>

            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-3 z-10 font-bold text-sm flex items-center justify-center gap-2 transition-colors duration-300 ${
                tab === "register" ? "text-white" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          {/* FORM CONTENT WITH FADE-IN */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "login" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "login" ? 10 : -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === "login" ? <LoginForm /> : <RegisterForm />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER HINT */}
        <p className="text-center mt-8 text-slate-600 text-xs tracking-widest uppercase font-medium">
          Secure & Encrypted Session
        </p>
      </motion.div>
    </div>
  );
}