"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Security updated successfully! 🎉", {
          style: { background: "#0f172a", color: "#fff" },
        });
        setTimeout(() => router.push("/login"), 1500);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Server connection lost");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#050505] px-4 relative overflow-hidden">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* HEADER */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-center shadow-2xl mb-6">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Set New Password</h2>
          <p className="text-slate-500 text-sm mt-2">
            Choose a strong password to protect your account.
          </p>
        </div>

        {/* GLASS CARD */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-5">
            
            {/* NEW PASSWORD */}
            <div className="relative flex items-center text-slate-400 focus-within:text-emerald-400 transition-colors">
              <Lock className="absolute left-4" size={18} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none text-sm text-white placeholder-slate-600 focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative flex items-center text-slate-400 focus-within:text-emerald-400 transition-colors">
              <Lock className="absolute left-4" size={18} />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none text-sm text-white placeholder-slate-600 focus:border-emerald-500/40 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleReset}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 mt-2"
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  Secure Account <CheckCircle2 size={18} />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* SECURITY FOOTER */}
        <p className="text-center mt-8 text-slate-700 text-[10px] uppercase tracking-widest font-bold">
          Step 2 of 2: Password Finalization
        </p>
      </motion.div>
    </div>
  );
}