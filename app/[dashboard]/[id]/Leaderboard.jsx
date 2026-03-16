"use client";
import { motion } from "framer-motion";
import { Trophy, User } from "lucide-react";

export default function Leaderboard({ students }) {
  const sortedStudents = [...students]
    .filter((s) => s.score !== undefined)
    .sort((a, b) => b.score - a.score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl overflow-hidden"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <Trophy className="text-yellow-500" size={20} />
            Leaderboard
          </h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-1">
            Top Performers
          </p>
        </div>
        <div className="bg-white/5 px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/10 text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-slate-400">
          {sortedStudents.length} Students
        </div>
      </div>

      {/* TABLE HEADERS - Adjusted grid for mobile */}
      <div className="grid grid-cols-[40px_1fr_60px] md:grid-cols-[50px_1fr_120px_80px] px-4 md:px-6 mb-4 text-[9px] md:text-[10px] uppercase tracking-widest font-black text-slate-500">
        <span>Rank</span>
        <span>Student</span>
        <span className="hidden md:block text-center">Reg No</span>
        <span className="text-right">Score</span>
      </div>

      {/* LIST */}
      <div className="space-y-2 md:space-y-3">
        {sortedStudents.map((s, i) => {
          const isTop3 = i < 3;
          const rankColors = [
            "border-yellow-500/50 bg-yellow-500/5 text-yellow-200", 
            "border-slate-300/30 bg-slate-300/5 text-slate-200",   
            "border-orange-500/30 bg-orange-500/5 text-orange-200", 
          ];

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-[40px_1fr_60px] md:grid-cols-[50px_1fr_120px_80px] items-center px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all ${
                isTop3 
                ? rankColors[i] 
                : "bg-white/[0.02] border-white/5 hover:border-white/10 text-slate-300"
              }`}
            >
              {/* RANK */}
              <div className="font-black text-sm md:text-lg italic">
                {i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `#${i + 1}`}
              </div>

              {/* NAME */}
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`hidden sm:flex h-7 w-7 md:h-8 md:w-8 rounded-full items-center justify-center border ${isTop3 ? 'border-current' : 'border-white/10 bg-white/5'}`}>
                  <User size={12} />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold truncate max-w-[100px] md:max-w-[150px] text-sm md:text-base">{s.name}</span>
                    {/* Show RegNo under name on mobile only */}
                    <span className="md:hidden text-[10px] opacity-50 font-mono">{s.regNo}</span>
                </div>
              </div>

              {/* REG NO (Desktop Only) */}
              <div className="hidden md:block text-center font-mono text-xs opacity-60">
                {s.regNo}
              </div>

              {/* SCORE */}
              <div className="text-right font-black text-lg md:text-xl tracking-tighter">
                {s.score}
              </div>
            </motion.div>
          );
        })}

        {sortedStudents.length === 0 && (
          <div className="text-center py-10 md:py-12 border-2 border-dashed border-white/5 rounded-2xl md:rounded-3xl">
            <p className="text-slate-600 text-sm font-medium">No results recorded yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}