"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, ArrowLeft, KeyRound, Send } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Reset link sent! Check your inbox 📩", {
          style: { background: "#0f172a", color: "#fff" },
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#050505] relative overflow-hidden">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* ICON HEADER */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-purple-600/20 border border-purple-500/30 rounded-2xl flex items-center justify-center shadow-2xl mb-4">
            <KeyRound size={28} className="text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Forgot Password?</h2>
          <p className="text-slate-500 text-sm mt-2 text-center max-w-[280px]">
            No worries! Enter your email and we'll send you recovery instructions.
          </p>
        </div>

        {/* GLASS CARD */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-6">
            
            {/* EMAIL INPUT */}
            <div className="space-y-1">
              <div className="relative flex items-center text-slate-400 focus-within:text-purple-400 transition-colors">
                <Mail className="absolute left-4" size={18} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 transition-all outline-none text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:bg-white/[0.07]"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
            >
              {loading ? (
                "Sending..."
              ) : (
                <>
                  Send Reset Link <Send size={16} />
                </>
              )}
            </motion.button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center mt-8 text-slate-600 text-[10px] uppercase tracking-widest font-bold">
          Encrypted Recovery System
        </p>
      </motion.div>
    </div>
  );
}