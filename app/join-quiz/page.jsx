"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Hash, Lock, Play, ShieldAlert, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function StudentQuizAccess() {
  const router = useRouter();

  const [subjectCode, setSubjectCode] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    if (!subjectCode || !quizCode) {
      toast.error("Please fill all fields", {
        style: { background: "#1e293b", color: "#fff" },
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/StudentquizDetails-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectCode, quizCode }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Identity Verified!");
        router.push(`/join-quiz/${quizCode}/student-info`);
      } else {
        toast.error(data.message || "Access Denied: Invalid details");
      }
    } catch (error) {
      toast.error("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 text-white relative overflow-hidden">
      
      {/* RADIANT BACKGROUND EFFECT */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* BACK NAVIGATION */}
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Exit to Home</span>
        </Link>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">
            Exam <span className="text-blue-500">Check-in</span>
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your credentials to access the secure examination environment.
          </p>
        </div>

        {/* GLASS FORM CONTAINER */}
        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="space-y-5">
            
            {/* SUBJECT CODE */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-2">Subject Reference</label>
              <div className="relative flex items-center text-slate-400 focus-within:text-blue-400 transition-colors">
                <Hash className="absolute left-4" size={18} />
                <input
                  placeholder="e.g. CS101"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* QUIZ PASSWORD */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500 ml-2">Access Key</label>
              <div className="relative flex items-center text-slate-400 focus-within:text-blue-400 transition-colors">
                <Lock className="absolute left-4" size={18} />
                <input
                  placeholder="Enter 6-digit key"
                  type="password"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none text-sm text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                />
              </div>
            </div>

            {/* START BUTTON */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={startQuiz}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 mt-4"
            >
              {loading ? (
                "Validating..."
              ) : (
                <>
                  Enter Examination <Play size={16} fill="currentColor" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* PROCTORING NOTICE */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3 items-start"
        >
          <ShieldAlert className="text-amber-500 shrink-0" size={18} />
          <p className="text-[11px] text-amber-500/80 leading-relaxed">
            <span className="font-bold">Proctoring Active:</span> By entering, you agree to the monitoring of screen activity and tab switches. Malpractice will be reported to the instructor automatically.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}