"use client";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link"
import { 
  Trophy, 
  BarChart3, 
  ShieldAlert, 
  ChevronLeft,
  Lock, 
  Unlock, 
  LayoutDashboard,
  Users,
  Menu,
  X,
  Timer,BookOpen,
  CheckCircle2 
} from "lucide-react";

import Leaderboard from "./Leaderboard";
import ScoreGraph from "./ScoreGraph";
import MalpracticeList from "./MalpracticeList"

export default function QuizDetails() {
  const { id, dashboard } = useParams();
  const [activeTab, setActiveTab] = useState("overview"); 
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
 const [time, settime] = useState()
 const [questions, setquestions] = useState([])

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
          settime(data.time)
          setquestions(data.questions)
          
          const averageScore = studentsData.length > 0 
            ? studentsData.reduce((acc, curr) => acc + (curr.score || 0), 0) / studentsData.length 
            : 0;

          setQuiz({ quizCode: data.coursecode, studentCount: studentsData.length, averageScore });
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#050505] text-slate-200 font-sans">
      
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* MOBILE BACK BUTTON: Direct access without opening menu */}
        <Link 
          href={`/${dashboard}`} 
          className="p-2 -ml-2 bg-white/5 rounded-lg text-slate-300 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold text-white truncate max-w-[150px]">
          {quiz?.quizCode || "Quiz"}
        </h1>
      </div>
      <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-indigo-400">
        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
    </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-black backdrop-blur-xl p-6 flex flex-col gap-8 transition-transform duration-300 lg:translate-x-0 lg:static
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Link 
          href={`/${dashboard}`} 
          className="p-2 -ml-2 bg-white/5 rounded-lg text-slate-300 w-15 active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </Link>
        <div className="hidden lg:block">
          <h2 className="text-indigo-400 font-bold tracking-widest text-xs uppercase mb-4">Quiz Control</h2>
        </div>
        
        <div className="space-y-2">
          <NavButton 
            active={activeTab === "overview"} 
            onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }} 
            icon={<LayoutDashboard size={20}/>} 
            label="Overview" 
          />
          <NavButton 
            active={activeTab === "leaderboard"} 
            onClick={() => { setActiveTab("leaderboard"); setIsMobileMenuOpen(false); }} 
            icon={<Trophy size={20}/>} 
            label="Leaderboard" 
          />
          <NavButton 
            active={activeTab === "analytics"} 
            onClick={() => { setActiveTab("analytics"); setIsMobileMenuOpen(false); }} 
            icon={<BarChart3 size={20}/>} 
            label="Analytics" 
          />
          <NavButton 
            active={activeTab === "proctoring"} 
            onClick={() => { setActiveTab("proctoring"); setIsMobileMenuOpen(false); }} 
            icon={<ShieldAlert size={20}/>} 
            label="Proctoring" 
            badge={students.filter(s => s.malpracticeCount > 0).length}
          />
        </div>

        <div className="mt-auto border-t border-white/10 pt-6">
           <button
            onClick={toggleQuizLock}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              isLocked ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500 text-white shadow-lg shadow-rose-500/20"
            }`}
          >
            {isLocked ? <Unlock size={18} /> : <Lock size={18} />}
            {isLocked ? "Open Quiz" : "Close Quiz"}
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <header className="mb-8 md:mb-10">
          <p className="text-indigo-400 text-sm md:text-base font-medium mb-1">Quiz ID: {id}</p>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white">{quiz?.quizCode || "Quiz"} Dashboard</h1>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >{activeTab === "overview" && (
  <div className="space-y-8">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard title="Total Joined" value={studentCount} icon={<Users className="text-blue-400" />} />
      <StatCard title="Avg. Score" value={`${quiz?.averageScore.toFixed(1) || 0}`} icon={<Trophy className="text-amber-400" />} />
      <StatCard title="Status" value={isLocked ? "Locked" : "Live"} icon={<div className={`h-3 w-3 rounded-full animate-pulse ${isLocked ? 'bg-gray-500' : 'bg-green-500'}`} />} />
      <StatCard title="Time Allocated" value={`${time} min`} icon={<Timer className="text-blue-400" />} />
    </div>

    {/* Questions List */}
    <div className="bg-white bg-white/[0.03] rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-indigo-500" />
        Quiz Questions
      </h3>
      
      <div className="space-y-6">
        {questions?.map((q, qIndex) => (
          <div key={q.id || qIndex} className="pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-3">
              {qIndex + 1}. {q.question}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {q.options.map((option, oIndex) => {
                const isCorrect = option === q.correct;
                return (
                  <div 
                    key={oIndex}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      isCorrect 
                        ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400 font-medium" 
                        : "bg-gray-50 border-gray-100 text-gray-600 dark:bg-gray-900/40 dark:border-gray-800 dark:text-gray-400"
                    }`}
                  >
                    <span className="mr-2 opacity-50">{String.fromCharCode(65 + oIndex)}.</span>
                    {option}
                    {isCorrect && <CheckCircle2 className="w-4 h-4 inline ml-2 mb-0.5" />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

            {activeTab === "leaderboard" && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl overflow-x-auto">
                <h3 className="text-xl md:text-2xl font-bold mb-6">Class Rankings</h3>
                <Leaderboard students={students} />
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold mb-6">Score Distribution</h3>
                <div className="h-[300px] md:h-[400px] w-full">
                  <ScoreGraph students={students} />
                </div>
              </div>
            )}

            {activeTab === "proctoring" && (
              <div className="bg-rose-500/[0.02] border border-rose-500/20 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl">
                <h3 className="text-xl md:text-2xl font-bold mb-6 text-rose-400">Malpractice Logs</h3>
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
    <div className="bg-white/[0.03] border border-white/10 p-5 md:p-6 rounded-2xl flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <p className="text-slate-400 text-xs md:text-sm font-medium uppercase tracking-wider">{title}</p>
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
      </div>
      <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
      
    </div>
  );
}