"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { User, IdCard, Mail, ArrowRight, ShieldCheck } from "lucide-react";
export default function StudentInfo() {
  const router = useRouter();
  const { quiz } = useParams();
  const quizid = quiz;

  const [form, setForm] = useState({
    name: "",
    regNo: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.regNo || !form.email) {
      toast.error("Please provide all identification details", {
        style: { background: "#1e293b", color: "#fff" },
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/student-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quizid }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Identity Verified!", {
          icon: "✅",
          style: { background: "#0f172a", color: "#fff" },
        });

        // Navigate after success
        setTimeout(() => {
          router.push(`/join-quiz/${quiz}/${data.id}`);
        }, 1200);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-white relative overflow-hidden">
      
      {/* BACKGROUND DECOR */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* HEADER SECTION */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 mb-4 shadow-2xl">
            <ShieldCheck className="text-blue-400" size={32} />
          </div>
          <h2 className="text-3xl font-bold tracking-tighter">Student Profile</h2>
          <p className="text-slate-500 text-sm mt-2">
            This information will be attached to your submission.
          </p>
        </div>

        {/* GLASS CARD */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-5">
            
            {/* NAME INPUT */}
            <div className="space-y-1">
              <div className="relative flex items-center text-slate-400 focus-within:text-blue-400 transition-colors">
                <User className="absolute left-4" size={18} />
                <input
                  name="name"
                  placeholder="Full Name"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* REGISTRATION NUMBER */}
            <div className="space-y-1">
              <div className="relative flex items-center text-slate-400 focus-within:text-blue-400 transition-colors">
                <IdCard className="absolute left-4" size={18} />
                <input
                  name="regNo"
                  placeholder="Registration / Roll Number"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <div className="relative flex items-center text-slate-400 focus-within:text-blue-400 transition-colors">
                <Mail className="absolute left-4" size={18} />
                <input
                  name="email"
                  type="email"
                  placeholder="Institutional Email Address"
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-4"
            >
              {loading ? (
                "Setting up environment..."
              ) : (
                <>
                  Start Examination <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* FOOTER HINT */}
        <p className="text-center mt-8 text-[10px] uppercase tracking-[0.3em] font-black text-slate-600">
          Ensure details match your ID card
        </p>
      </motion.div>
    </div>
  );
}