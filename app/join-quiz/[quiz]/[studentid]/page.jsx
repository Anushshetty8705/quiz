"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  CheckCircle, 
  ShieldAlert, 
  Loader2,
  LayoutGrid
} from "lucide-react";

export default function QuizStart() {
  const { quiz, studentid } = useParams();
  const quizId = quiz;
  const studentId = studentid;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [locked, setLocked] = useState(false);
  const [reason, setReason] = useState("");
  const [timeLeft, setTimeLeft] = useState();
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  /* SECURITY & LOGIC (Keeping your original logic intact) */
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    const preventKeys = (e) => {
      if ((e.ctrlKey && ["c", "v", "x", "u", "s"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") || e.key === "F12") {
        e.preventDefault();
      }
    };
    document.addEventListener("copy", preventDefault);
    document.addEventListener("paste", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("keydown", preventKeys);
    return () => {
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("paste", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("keydown", preventKeys);
    };
  }, []);

  useEffect(() => {
    if (showResult || locked) return;
    const handleSecurity = () => {
      if (document.hidden) reportLock("Tab switching detected!");
      if (window.innerHeight < screen.height - 150) reportLock("Floating window or Split-screen detected!");
    };
    document.addEventListener("visibilitychange", handleSecurity);
    window.addEventListener("resize", handleSecurity);
    return () => {
      document.removeEventListener("visibilitychange", handleSecurity);
      window.removeEventListener("resize", handleSecurity);
    };
  }, [showResult, locked]);

  const reportLock = async (lockReason) => {
    setLocked(true);
    setReason(lockReason);
    try {
      await fetch("/api/quiz-locked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, quizId, reason: lockReason }),
      });
    } catch (err) { console.error("Lock report failed", err); }
  };

  useEffect(() => {
    if (!studentId || !quizId || showResult) return;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/check-student?studentId=${studentId}&quizId=${quizId}`);
        const data = await res.json();
        if (data.success && data.student.submitted) {
          setShowResult(true);
          setScore(data.student.score);
        } else if (data.success) {
          setLocked(data.student.locked);
          setReason(data.student.lockedReason || "");
        }
      } catch (error) { console.error("Status check failed:", error); }
    };
    const interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, [studentId, quizId, showResult]);


  useEffect(() => {
    if (timeLeft <= 0 && timeLeft !== undefined) {
      setLocked(true);
      reportLock("Time is over!");
      return;
    }
    if (timeLeft === 30) toast("⚠️ Submit your quiz now!");
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch(`/api/questions?quizid=${quizId}`);
      const data = await res.json();
      if (data.success) {
        setTimeLeft(Number(data.Time) * 60);
        const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
        setQuestions(shuffle(data.questions.map(q => ({ 
          ...q, 
          options: shuffle(q.options) 
        }))));
      }
    };
    if (quizId) fetchQuestions();
  }, [quizId]);

  const handleSubmit = async () => {
    const total = questions.reduce((acc, q, i) => (answers[i] === q.correct ? acc + 1 : acc), 0);
    setScore(total);
    setShowResult(true);
    await fetch("/api/student-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: total, studentId, quizId }),
    });
  };

  const formatTime = () => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  /* UI: LOADING, LOCK, RESULT (Kept similar but made padding responsive) */
  if (!questions.length && !locked && !showResult) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-indigo-500 animate-spin" size={40} />
        <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase text-center">Initializing Secure Environment...</p>
      </div>
    </div>
  );

  if (locked) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050000] text-white p-6 relative">
      <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 bg-white/[0.03] border border-red-500/30 backdrop-blur-3xl p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] text-center max-w-md">
        <ShieldAlert className="text-red-500 mx-auto mb-6" size={48} />
        <h1 className="text-2xl md:text-3xl font-black mb-4 uppercase">Suspended</h1>
        <p className="text-red-400 font-bold mb-4">{reason}</p>
        <p className="text-slate-500 text-sm">Please contact the administrator to unlock your session.</p>
      </motion.div>
    </div>
  );

  if (showResult) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center w-full max-w-md">
        <CheckCircle className="text-emerald-400 mx-auto mb-6" size={60} />
        <h1 className="text-4xl font-black mb-6 italic">FINISHED.</h1>
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] mb-6">
          <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black mb-2">Final Score</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl font-black text-emerald-400">{score}</span>
            <span className="text-xl text-slate-600 font-bold">/ {questions.length}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-x-hidden select-none">
      <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* HEADER: Responsive Spacing */}
      <header className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 p-6 md:px-12 md:pt-12 z-20">
        <div className="text-center sm:text-left">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Live Session</h2>
          <p className="text-lg md:text-xl font-bold tracking-tight">Secure Assessment</p>
        </div>
        <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/[0.03] border-white/10 text-white'}`}>
          <Clock size={18} />
          <span className="font-mono text-lg md:text-xl font-bold">{formatTime()}</span>
        </div>
      </header>

      {/* MAIN CONTENT: Responsive Grid */}
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 p-6 md:px-12 pb-24 lg:pb-12 z-10 flex-1">
        
        <main className="flex flex-col">
          {/* PROGRESS BAR */}
          <div className="mb-8">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
               <span>Q. {current + 1} of {questions.length}</span>
               <span className="hidden sm:block">{Math.round(((current + 1) / questions.length) * 100)}% Complete</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                  className="h-full bg-indigo-500" 
                />
             </div>
          </div>

          {/* QUESTION BOX */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="flex-1"
            >
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-snug mb-8">
                {questions[current]?.question}
              </h2>

              <div className="grid gap-3 md:gap-4">
                {questions[current]?.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers({ ...answers, [current]: opt })}
                    className={`group relative p-5 md:p-6 rounded-2xl md:rounded-[2rem] border text-left transition-all ${
                      answers[current] === opt
                        ? "bg-indigo-600/10 border-indigo-500 text-white"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm md:text-base font-medium">{opt}</span>
                      <div className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        answers[current] === opt ? "bg-indigo-500 border-indigo-500" : "border-white/10"
                      }`}>
                        {answers[current] === opt && <CheckCircle size={12} className="text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* NAVIGATION BUTTONS */}
          <div className="mt-10 flex items-center justify-between gap-4">
             <button 
                onClick={() => setCurrent(Math.max(0, current - 1))}
                className={`text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors p-2 ${current === 0 ? 'invisible' : ''}`}
             >
                Back
             </button>
             
             {current === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-6 md:px-10 py-3.5 md:py-4 bg-emerald-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  Finalize <ChevronRight size={16} />
                </button>
             ) : (
                <button
                  onClick={() => setCurrent(current + 1)}
                  className="px-6 md:px-10 py-3.5 md:py-4 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  Next <ChevronRight size={16} />
                </button>
             )}
          </div>
        </main>

        {/* QUESTION MAP: Responsive Side/Bottom Placement */}
        <aside className="mt-8 lg:mt-0">
            <div className="bg-white/[0.03] border border-white/10 p-5 md:p-6 rounded-[2rem] md:sticky md:top-12">
                <div className="flex items-center gap-2 mb-6 px-1">
                  <LayoutGrid size={14} className="text-slate-500" />
                  <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-500">Jump to Question</h3>
                </div>
                
                {/* Scrollable grid on very small screens, fixed on desktop */}
                <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-2 md:gap-3 max-h-[200px] lg:max-h-none overflow-y-auto pr-1 custom-scrollbar">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-9 md:h-10 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all border ${
                                current === idx 
                                ? "bg-indigo-500 border-indigo-500 text-white shadow-md shadow-indigo-500/20" 
                                : answers[idx] 
                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" 
                                : "bg-white/[0.02] border-white/5 text-slate-600"
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}