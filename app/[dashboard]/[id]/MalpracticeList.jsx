"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Unlock, User, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function MalpracticeList({ students }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Sync local state with parent props
    const malpracticeReports = students.filter((student) => student.locked);
    setReports(malpracticeReports);
  }, [students]);

  const handleUnlock = async (studentId, quizId) => {
    try {
      const res = await fetch("/api/unlock-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, quizId }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Security lock bypassed", {
          style: { background: "#064e3b", color: "#fff" }
        });
        setReports(reports.filter((r) => r.id !== studentId));
      } else {
        toast.error("Unlock command failed");
      }
    } catch (err) {
      toast.error("System connection error");
    }
  };

  if (!reports.length)
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-white/[0.02] border border-dashed border-white/10 rounded-[2rem]">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
          <ShieldAlert className="text-emerald-500/50" size={24} />
        </div>
        <p className="text-slate-500 font-medium text-sm tracking-wide">No active security violations detected.</p>
      </div>
    );

  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      <div className="flex items-center gap-2 mb-4 px-2">
        <AlertCircle className="text-red-500" size={18} />
        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-red-500/80">Security Incident Log</h3>
      </div>

      <AnimatePresence>
        {reports.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: i * 0.05 }}
            className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl p-5 hover:bg-white/[0.05] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* STUDENT INFO */}
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <User size={18} className="text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white leading-tight">{r.name}</h4>
                  <p className="text-xs font-mono text-slate-500 mt-1">{r.regNo}</p>
                </div>
              </div>

              {/* VIOLATION REASON */}
              <div className="flex-1 md:px-6">
                <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1.5 rounded-xl">
                  <Clock size={14} />
                  <span className="text-xs font-bold uppercase tracking-wider italic">
                    {r.lockedReason || "Tab Switch Detected"}
                  </span>
                </div>
              </div>

              {/* ACTION */}
              <button
                onClick={() => handleUnlock(r.id, r.quizId)}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20"
              >
                <Unlock size={14} />
                Authorize Unlock
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}