"use client";
import { motion } from "framer-motion";
import { Trophy, Medal, User, Hash } from "lucide-react";

export default function Leaderboard({ students }) {
  // Sort and filter students
  const sortedStudents = [...students]
    .filter((s) => s.score !== undefined)
    .sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Trophy className="text-yellow-500" size={24} />
            Leaderboard
          </h2>
          <p className="text-slate-500 text-xs uppercase tracking-widest font-bold mt-1">
            Top Performers
          </p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-tighter text-slate-400">
          {sortedStudents.length} Students
        </div>
      </div>

      {/* TABLE HEADERS (Custom) */}
      <div className="grid grid-cols-[50px_1fr_120px_80px] px-6 mb-4 text-[10px] uppercase tracking-widest font-black text-slate-500">
        <span>Rank</span>
        <span>Student</span>
        <span className="text-center">Reg No</span>
        <span className="text-right">Score</span>
      </div>

      {/* LIST */}
      <div className="space-y-3">
        {sortedStudents.map((s, i) => {
          const isTop3 = i < 3;
          const rankColors = [
            "border-yellow-500/50 bg-yellow-500/5 text-yellow-200", // Gold
            "border-slate-300/30 bg-slate-300/5 text-slate-200",   // Silver
            "border-orange-500/30 bg-orange-500/5 text-orange-200", // Bronze
          ];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-[50px_1fr_120px_80px] items-center px-6 py-4 rounded-2xl border transition-all ${
                isTop3 
                ? rankColors[i] 
                : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] text-slate-300"
              }`}
            >
              {/* RANK */}
              <div className="font-black text-lg italic">
                {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `#${i + 1}`}
              </div>

              {/* NAME */}
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center border ${isTop3 ? 'border-current' : 'border-white/10 bg-white/5'}`}>
                  <User size={14} />
                </div>
                <span className="font-bold truncate max-w-[150px]">{s.name}</span>
              </div>

              {/* REG NO */}
              <div className="text-center font-mono text-xs opacity-60">
                {s.regNo}
              </div>

              {/* SCORE */}
              <div className="text-right font-black text-xl tracking-tighter">
                {s.score}
              </div>
            </motion.div>
          );
        })}

        {sortedStudents.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
            <p className="text-slate-600 font-medium">No results recorded yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}