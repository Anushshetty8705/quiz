"use client";
import { motion } from "framer-motion";



export default function Leaderboard({students}) {
  students=students.sort((a, b) => b.score - a.score).filter(s => s.score !== undefined) ; 
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 shadow-xl"
    >
      <h2 className="text-xl font-bold mb-4">🏆 Leaderboard</h2>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-300 border-b border-white/20">
            <th className="text-left py-2">Name</th>
            <th>Reg No</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr key={i} className="border-b border-white/10">
              <td className="py-2">{s.name}</td>
              <td className="text-center">{s.regNo}</td>
              <td className="text-center font-bold text-green-400">{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}