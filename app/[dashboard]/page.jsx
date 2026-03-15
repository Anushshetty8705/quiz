"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";
import { Plus, LogOut, User, BookOpen, Users, Lock, Unlock, ChevronRight, LayoutGrid } from "lucide-react";

// IMPORT THE NEW COMPONENT
import Profile from "./Profile"; 

export default function TeacherDashboard() {
  const { dashboard } = useParams();
  const [activeTab, setActiveTab] = useState("quizzes");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(`/api/teacher-quiz?teacherId=${dashboard}`);
        const data = await res.json();
        if (data.success){
          setTeacherName(data.username);
          setQuizzes(data.quizzes);
        } 
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      } finally {
        setLoading(false);
      }
    };
    if (dashboard) fetchQuizzes();
  }, [dashboard]);

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-200">
      
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-white/10 bg-black/50 backdrop-blur-2xl hidden md:flex flex-col p-8 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/40">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-white block">QuizPro</span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-600">Teacher Hub</span>
          </div>
        </div>

        <nav className="flex-1 space-y-3">
          <TabButton icon={<LayoutGrid size={20}/>} label="My Quizzes" active={activeTab === "quizzes"} onClick={() => setActiveTab("quizzes")} />
          <TabButton icon={<User size={20}/>} label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </nav>

        <button onClick={() => signOut({ callbackUrl: "/" })} className="mt-auto flex items-center gap-3 px-5 py-4 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-rose-500/10 font-black uppercase tracking-widest text-[10px]">
          <LogOut size={16}/> Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 border-b border-white/10 flex items-center justify-between px-10 bg-black/20 backdrop-blur-md">
          <h1 className="text-xl font-black text-white uppercase tracking-widest italic">
            {activeTab === "quizzes" ? "Assessment Manager" : "Instructor Settings"}
          </h1>
          <div className="flex items-center gap-8">
            {activeTab === "quizzes" && (
              <Link href={`/${dashboard}/create-quiz`}>
                <button className="hidden sm:flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition shadow-lg shadow-indigo-600/20">
                  <Plus size={16} /> Create Quiz
                </button>
              </Link>
            )}
            <TeacherProfile teacherName={teacherName} />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "quizzes" ? (
              <motion.div key="quizzes-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 px-2">
                  <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">My Quizzes</h2>
                    <p className="text-slate-500 font-medium">Monitoring {quizzes.length} live sessions.</p>
                  </div>
                </div>

                {loading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1,2,3].map(i => <div key={i} className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                    {quizzes.map((quiz, idx) => (
                      <QuizCard key={quiz._id} quiz={quiz} dashboard={dashboard} index={idx} />
                    ))}
                    <Link href={`/${dashboard}/create-quiz`} className="group">
                      <div className="border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-[2.5rem] h-full min-h-[260px] flex flex-col items-center justify-center gap-4 transition-all hover:bg-indigo-500/5 cursor-pointer">
                        <Plus className="text-slate-600 group-hover:text-indigo-400" size={32} />
                        <span className="text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]">Initialize Exam</span>
                      </div>
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : (
              // CALL THE PROFILE COMPONENT HERE
              <Profile teacherName={teacherName} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Sidebar Button Helper
function TabButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
      {icon} <span className="font-semibold text-sm">{label}</span>
      {active && <motion.div layoutId="activeTabPill" className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
    </button>
  );
}

// Mini Profile Helper (Header)
function TeacherProfile({ teacherName }) {
  return (
    <div className="flex items-center gap-3 pl-6 border-l border-white/10">
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-white capitalize">{teacherName}</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Instructor</p>
      </div>
      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px]">
        <div className="h-full w-full rounded-[10px] bg-[#050505] flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Quiz Card Helper
function QuizCard({ quiz, dashboard, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="group bg-white/[0.03] border border-white/10 p-7 rounded-[2.5rem]">
      <div className="flex justify-between mb-6">
        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><BookOpen size={24} /></div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${quiz.isLocked ? "border-slate-500/20 text-slate-400" : "border-emerald-500/20 text-emerald-400"}`}>
          {quiz.isLocked ? "Locked" : "Active"}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{quiz.subjectCode}</h3>
      <p className="text-slate-500 text-[10px] font-mono mb-6">Code: {quiz.quizCode}</p>
      <Link href={`/${dashboard}/${quiz.quizCode}`}>
        <button className="w-full bg-white text-black font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all">
          Manage Quiz <ChevronRight size={16} className="inline ml-1" />
        </button>
      </Link>
    </motion.div>
  );
}