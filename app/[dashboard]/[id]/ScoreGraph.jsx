"use client";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BarChart3, TrendingUp, Users } from "lucide-react";

export default function ScoreGraph({ students }) {
  // Data processing
  const processedData = [...students]
    .filter((s) => s.score !== undefined)
    .sort((a, b) => a.score - b.score)
    .map((s) => ({
      name: s.name.split(" ")[0],
      score: s.score,
    }));

  const avgScore = processedData.length 
    ? (processedData.reduce((acc, s) => acc + s.score, 0) / processedData.length).toFixed(1)
    : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-1">Student Score</p>
          <p className="text-sm font-bold text-white">{payload[0].payload.name}</p>
          <p className="text-xl font-black text-indigo-400">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-2xl"
    >
      {/* HEADER & QUICK STATS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="text-indigo-400" size={24} />
            Performance Analytics
          </h2>
          <p className="text-slate-500 text-[10px] md:text-xs uppercase tracking-widest font-bold mt-1">
            Score Distribution Curve
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-3 flex-1">
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Avg. Score</p>
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-lg md:text-xl font-black text-white">{avgScore}</span>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl md:rounded-2xl px-4 py-3 md:px-5 md:py-3 flex-1">
            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-tighter mb-1">Participants</p>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-indigo-400" />
              <span className="text-lg md:text-xl font-black text-white">{processedData.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHART CONTAINER */}
      <div className="w-full h-64 md:h-72 lg:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#475569" 
              fontSize={9} 
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              dy={10}
              // Hide labels on very small screens to prevent overlap, or show every Nth
              interval={processedData.length > 10 ? "preserveStartEnd" : 0}
              hide={typeof window !== 'undefined' && window.innerWidth < 640} 
            />
            <YAxis 
              stroke="#475569" 
              fontSize={9} 
              fontWeight="bold"
              tickLine={false}
              axisLine={false}
              dx={-5}
            />
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }}
              // Ensure tooltip doesn't get cut off on mobile
              position={{ y: 0 }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={window?.innerWidth < 768 ? 2 : 4} // Thinner line on mobile
              fillOpacity={1}
              fill="url(#colorScore)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}