"use client";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";



export default function scoreGraph({students}) {
  students=students.sort((a, b) => b.score - a.score).filter(s => s.score !== undefined) ;
  const data = students.map(s => ({
    name: s.name,
    score: s.score || 0
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-xl"
    >
      <h2 className="text-xl font-bold mb-4">📊 Score Distribution</h2>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}