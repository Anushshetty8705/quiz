"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import { 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  CheckCircle, 
  ShieldAlert, 
  Loader2 
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
  const [timeLeft, setTimeLeft] = useState(600);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  /* ==========================================================
     🚫 SECURITY: ANTI-CHEAT & INPUT BLOCKING
     ========================================================== */
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();
    const preventKeys = (e) => {
      if (
        (e.ctrlKey && ["c", "v", "x", "u", "s"].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") ||
        e.key === "F12"
      ) {
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

  /* ==========================================================
     🔒 SECURITY: TAB SWITCH & FLOATING WINDOW DETECTION
     ========================================================== */
  useEffect(() => {
    if (showResult || locked) return;

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

    const handleSecurity = () => {
      if (document.hidden) {
        reportLock("Tab switching detected!");
      }
      // Floating window / Split screen detection
      if (window.innerHeight < screen.height - 150) {
        reportLock("Floating window or Split-screen detected!");
      }
    };

    document.addEventListener("visibilitychange", handleSecurity);
    window.addEventListener("resize", handleSecurity);

    return () => {
      document.removeEventListener("visibilitychange", handleSecurity);
      window.removeEventListener("resize", handleSecurity);
    };
  }, [showResult, locked, studentId, quizId]);

  /* ==========================================================
     🔍 POLLING: REMOTE UNLOCK / STATUS CHECK
     ========================================================== */
  useEffect(() => {
    if (!studentId || !quizId || showResult) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/check-student?studentId=${studentId}&quizId=${quizId}`);
        const data = await res.json();
        if (!data.success) return;

        const student = data.student;

        console.log(student)
        if (student.submitted) {
          setShowResult(true);
          setScore(student.score);
        } else {
          setLocked(student.locked);
          setReason(student.lockedReason || "");
        }
      } catch (error) { console.error("Status check failed:", error); }
    };

    const interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, [studentId, quizId, showResult]);

  /* ==========================================================
     ⏳ CORE: TIMER & DATA FETCHING
     ========================================================== */
  useEffect(() => {
    if (timeLeft <= 0 && !showResult) {
      setLocked(true);
      setReason("Time is over!");
      return;
    }
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, showResult]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch(`/api/questions?quizid=${quizId}`);
      const data = await res.json();
      if (data.success) {
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

  /* ==========================================================
     UI: LOADING STATE
     ========================================================== */
  if (!questions.length && !locked && !showResult) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="text-indigo-500 animate-spin" size={40} />
        <p className="text-slate-500 font-bold tracking-widest text-xs uppercase">Initializing Exam...</p>
      </div>
    </div>
  );

  /* ==========================================================
     UI: LOCK SCREEN
     ========================================================== */
  if (locked) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050000] text-white p-6">
      <div className="absolute inset-0 bg-red-600/5 pointer-events-none animate-pulse" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 bg-white/[0.03] border border-red-500/30 backdrop-blur-3xl p-10 rounded-[2.5rem] text-center max-w-md shadow-2xl shadow-red-500/10">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="text-red-500" size={40} />
        </div>
        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Quiz Suspended</h1>
        <p className="text-red-400 font-bold mb-2">{reason}</p>
        <p className="text-slate-500 text-sm leading-relaxed">Your session has been terminated for security reasons. Please contact your instructor to verify your identity and resume.</p>
      </motion.div>
    </div>
  );

  /* ==========================================================
     UI: RESULT SCREEN
     ========================================================== */
  if (showResult) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6">
      <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="z-10 text-center">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <CheckCircle className="text-emerald-400" size={48} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4 italic">COMPLETED.</h1>
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 rounded-[3rem] inline-block mb-8">
          <p className="text-slate-500 uppercase tracking-widest font-bold text-xs mb-2">Final Score</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-7xl font-black text-emerald-400">{score}</span>
            <span className="text-2xl text-slate-600 font-bold">/ {questions.length}</span>
          </div>
        </div>
        <p className="text-slate-400 italic">Scores have been transmitted to the instructor portal.</p>
      </motion.div>
    </div>
  );

  /* ==========================================================
     UI: QUIZ INTERFACE
     ========================================================== */
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-6 lg:p-12 relative overflow-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      {/* TOP BAR */}
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center mb-12 z-10">
        <div>
          <h2 className="text-sm uppercase tracking-[0.3em] font-black text-slate-500">Live Session</h2>
          <p className="text-xl font-bold tracking-tight">Secure Examination Platform</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/[0.03] border-white/10 text-white'}`}>
          <Clock size={20} />
          <span className="font-mono text-xl font-bold">{formatTime()}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full grid lg:grid-cols-[1fr_300px] gap-8 z-10">
        <main>
          {/* PROGRESS BAR */}
          <div className="mb-8">
             <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">
               <span>Question {current + 1} of {questions.length}</span>
               <span>{Math.round(((current + 1) / questions.length) * 100)}% Complete</span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((current + 1) / questions.length) * 100}%` }}
                    className="h-full bg-indigo-500" 
                />
             </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                {questions[current]?.question}
              </h2>

              <div className="grid gap-4">
                {questions[current]?.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers({ ...answers, [current]: opt })}
                    className={`group relative p-6 rounded-[2rem] border text-left transition-all ${
                      answers[current] === opt
                        ? "bg-indigo-600/10 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.15)]"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{opt}</span>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        answers[current] === opt ? "bg-indigo-500 border-indigo-500" : "border-white/10 group-hover:border-white/30"
                      }`}>
                        {answers[current] === opt && <CheckCircle size={14} className="text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex items-center justify-between">
             <button 
                onClick={() => setCurrent(Math.max(0, current - 1))}
                className={`text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors ${current === 0 ? 'invisible' : ''}`}
             >
                Previous
             </button>
             
             {current === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-xl shadow-emerald-600/20 transition-all flex items-center gap-2"
                >
                  Finalize Submission <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setCurrent(current + 1)}
                  className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  Save & Next <ChevronRight size={18} />
                </button>
              )}
          </div>
        </main>

        {/* SIDEBAR NAVIGATION MAP */}
        <aside className="hidden lg:block">
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-[2.5rem] sticky top-12">
                <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-6 px-2">Question Map</h3>
                <div className="grid grid-cols-4 gap-3">
                    {questions.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-10 rounded-xl text-xs font-bold transition-all border ${
                                current === idx 
                                ? "bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                                : answers[idx] 
                                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" 
                                : "bg-white/[0.02] border-white/5 text-slate-600 hover:border-white/20"
                            }`}
                        >
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}