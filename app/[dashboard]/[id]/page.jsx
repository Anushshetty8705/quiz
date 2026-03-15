"use client";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { 
  Trophy, 
  BarChart3, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  LayoutDashboard,
  Users
} from "lucide-react";

import Leaderboard from "./Leaderboard";
import ScoreGraph from "./ScoreGraph";
import MalpracticeList from "./MalpracticeList";

export default function QuizDetails() {
  const { id, dashboard } = useParams();
  
  // State for Navigation
  const [activeTab, setActiveTab] = useState("overview"); 
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
const [studentCount, setStudentCount] = useState();
  useEffect(() => {
    let interval;
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quiz-details?teacherId=${dashboard}&quizId=${id}`, { cache: "no-store" });
        const data = await res.json();
        if (data.success) {
          const studentsData = data.quizzedetails || [];
          setStudents(studentsData);
          setIsLocked(data.isLocked);
         
       setStudentCount(studentsData.length);
          const averageScore = studentCount > 0 
            ? studentsData.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentCount 
            : 0;

          setQuiz({ quizCode: data.coursecode, studentCount, averageScore });
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };

    if (dashboard && id) {
      fetchQuiz();
      interval = setInterval(fetchQuiz, 2000);
    }
    return () => clearInterval(interval);
  }, [id, dashboard]);

  const toggleQuizLock = async () => {
    const res = await fetch("/api/toggle-quiz-lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: dashboard, quizId: id, lock: !isLocked }),
    });
    if ((await res.json()).success) setIsLocked(!isLocked);
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-indigo-500">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-200 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 border-r border-white/10 bg-black/50 backdrop-blur-xl p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-indigo-400 font-bold tracking-widest text-xs uppercase mb-4">Quiz Control</h2>
          <div className="space-y-2">
            <NavButton 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
              icon={<LayoutDashboard size={20}/>} 
              label="Overview" 
            />
            <NavButton 
              active={activeTab === "leaderboard"} 
              onClick={() => setActiveTab("leaderboard")} 
              icon={<Trophy size={20}/>} 
              label="Leaderboard" 
            />
            <NavButton 
              active={activeTab === "analytics"} 
              onClick={() => setActiveTab("analytics")} 
              icon={<BarChart3 size={20}/>} 
              label="Analytics" 
            />
            <NavButton 
              active={activeTab === "proctoring"} 
              onClick={() => setActiveTab("proctoring")} 
              icon={<ShieldAlert size={20}/>} 
              label="Proctoring" 
              badge={students.filter(s => s.malpracticeCount > 0).length}
            />
          </div>
        </div>

        <div className="mt-auto border-t border-white/10 pt-6">
           <button
            onClick={toggleQuizLock}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              isLocked ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500 text-white"
            }`}
          >
            {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
            {isLocked ? "Open Quiz" : "Close Quiz"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <p className="text-indigo-400 text-large font-large mb-1">Quizcode: {id}</p>
          <h1 className="text-4xl font-extrabold text-white">{quiz?.quizCode || "unknown"} Dashboard</h1>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Joined" value={studentCount} icon={<Users className="text-blue-400"/>} />
                <StatCard title="Avg. Score" value={`${quiz?.averageScore.toFixed(1) || 0}%`} icon={<Trophy className="text-amber-400"/>} />
                <StatCard title="Status" value={isLocked ? "Locked" : "Live"} icon={<div className={`h-3 w-3 rounded-full animate-pulse ${isLocked ? 'bg-gray-500' : 'bg-green-500'}`}/>} />
              </div>
            )}

            {activeTab === "leaderboard" && (
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Class Rankings</h3>
                <Leaderboard students={students} />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6">Score Distribution</h3>
                <ScoreGraph students={students} />
              </div>
            )}

            {activeTab === "proctoring" && (
              <div className="bg-rose-500/[0.02] border border-rose-500/20 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-rose-400">Malpractice Logs</h3>
                <MalpracticeList students={students} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

/* HELPER COMPONENTS */

function NavButton({ active, onClick, icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
        active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-white/5"
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      {badge > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-6 rounded-2xl">
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}