"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import ProctoringEngine from "../../../components/ProctoringEngine";
import { 
  Clock, 
  ChevronLeft,
  ChevronRight, 
  CheckCircle, 
  ShieldAlert, 
  Loader2,
  LayoutGrid,
  CameraOff,
  ShieldCheck,
  AlertCircle,
  Eye,
  CopyX,
  MonitorOff
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
  const [originalTime, setOriginalTime] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [cameraError, setCameraError] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false); // NEW: Terms State

  const prevLockedRef = useRef(false);

  /* SECURITY & LOGIC */
  useEffect(() => {
    if (!hasAcceptedTerms) return; // Only prevent defaults after starting

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
  }, [hasAcceptedTerms]);

  const reportLock = async (lockReason) => {
    setLocked(true);
    setReason(lockReason);
    try {
      await fetch("/api/student-cheating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, quizId, reason: lockReason }),
      });
    } catch (err) { console.error("Lock report failed", err); }
  };

  useEffect(() => {
    if (!studentId || !quizId || showResult || cameraError || !hasAcceptedTerms) return;
    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/check-student-status?studentId=${studentId}&quizId=${quizId}`);
        const data = await res.json();
        if (data.success) {
          if (data.student.submitted) { setShowResult(true); setScore(data.student.score); return; }
          if (prevLockedRef.current === true && data.student.locked === false) {
            if (reason === "Time is over!") setTimeLeft(originalTime * 60);
            toast.success("Session Resumed");
          }
          setLocked(data.student.locked);
          setReason(data.student.lockedReason || "");
          prevLockedRef.current = data.student.locked;
        }
      } catch (error) { console.error("Status check failed:", error); }
    };
    const interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, [studentId, quizId, showResult, reason, originalTime, cameraError, hasAcceptedTerms]);

  useEffect(() => {
    if (locked || timeLeft === undefined || timeLeft <= 0 || cameraError || !hasAcceptedTerms) {
      if (timeLeft === 0 && !locked && !cameraError && hasAcceptedTerms) reportLock("Time is over!");
      return;
    }
    const timer = setInterval(() => { setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)); }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, locked, cameraError, hasAcceptedTerms]);

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch(`/api/quiz-questions?quizid=${quizId}`);
      const data = await res.json();
      if (data.success) {
        const timeInMin = Number(data.Time);
        setOriginalTime(timeInMin);
        setTimeLeft(timeInMin * 60);
        const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
        setQuestions(shuffle(data.questions.map(q => ({ ...q, options: shuffle(q.options) }))));
      }
    };
    if (quizId) fetchQuestions();
  }, [quizId]);

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

  const handleSubmit = async () => {
    const total = questions.reduce((acc, q, i) => (answers[i] === q.correct ? acc + 1 : acc), 0);
    setScore(total);
    setShowResult(true);
    await fetch("/api/Submit-student-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: total, studentId, quizId }),
    });
  };

  /* UI RENDER LOGIC */

  // 1. Loading State
  if (!questions.length) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-black text-[10px] tracking-[0.3em] uppercase">
       <Loader2 className="animate-spin mr-3 text-indigo-500" /> Initializing...
    </div>
  );

  // 2. Terms & Conditions (Before Starting)
  if (!hasAcceptedTerms) return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="text-indigo-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Security Protocol</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">AI-Monitored Assessment</p>
          </div>
        </div>

        <div className="grid gap-4 mb-10">
          {[
            { icon: <CopyX size={18}/>, title: "No Cheating Tools", desc: "Copy, paste, and right-click are strictly disabled." },
            { icon: <MonitorOff size={18}/>, title: "Environment Lock", desc: "Tab switching or split-screen will lock your session instantly." },
            { icon: <Eye size={18}/>, title: "AI Face Monitoring", desc: "Turning head left/right, looking down, or talking will trigger warnings." },
            { icon: <AlertCircle size={18}/>, title: "Three Strikes Rule", desc: "Receiving 3 AI warnings will result in an automatic disqualification." }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="mt-1 text-indigo-400">{item.icon}</div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => setHasAcceptedTerms(true)}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          I Understand & Start Assessment
        </button>
      </motion.div>
    </div>
  );

  // 3. Camera Error Gate
  if (cameraError) return (
    <div className="min-h-screen fixed inset-0 z-[200] flex items-center justify-center bg-[#050000] text-white p-6">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CameraOff className="text-red-500" size={32} />
        </div>
        <h1 className="text-2xl font-black uppercase mb-4">Camera Required</h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-8">Please enable camera permissions in your browser and refresh.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">Refresh Page</button>
      </div>
    </div>
  );

  // 4. Locked/Suspended Gate
  if (locked) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050000] text-white p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white/[0.03] border border-red-500/30 p-12 rounded-[2.5rem] text-center max-w-md">
        <ShieldAlert className="text-red-500 mx-auto mb-6" size={48} />
        <h1 className="text-3xl font-black mb-4 uppercase">Suspended</h1>
        <p className="text-red-400 font-bold mb-4">{reason}</p>
        <p className="text-slate-500 text-sm">Please contact the administrator to unlock your session.</p>
      </motion.div>
    </div>
  );

  // 5. Result View
  if (showResult) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-6">
      <div className="text-center w-full max-w-md">
        <CheckCircle className="text-emerald-400 mx-auto mb-6" size={60} />
        <h1 className="text-4xl font-black mb-6 italic uppercase">Finished.</h1>
        <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem]">
          <p className="text-slate-500 uppercase tracking-widest text-[10px] font-black mb-2">Final Score</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-6xl font-black text-emerald-400">{score}</span>
            <span className="text-xl text-slate-600 font-bold">/ {questions.length}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 6. Main Quiz UI
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden select-none">
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center gap-4 p-5 md:p-10 z-20">
        <div className="flex flex-col">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-slate-500">Live Session</h2>
          <p className="text-base md:text-xl font-bold tracking-tight">Secure Assessment</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl border font-mono text-xl font-bold ${timeLeft < 60 ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/[0.03] border-white/10 text-white'}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </header>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 px-5 md:px-10 pb-12 flex-1">
        <main className="flex flex-col">
          <div className="mb-10">
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${((current + 1) / questions.length) * 100}%` }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
             </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={current} initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }} className="flex-1">
              <h2 className="text-xl md:text-3xl font-bold leading-tight mb-10">{questions[current]?.question}</h2>
              <div className="grid gap-4">
                {questions[current]?.options.map((opt, i) => (
                  <button key={i} onClick={() => setAnswers({ ...answers, [current]: opt })} className={`p-6 rounded-[2rem] border text-left transition-all ${answers[current] === opt ? "bg-indigo-600/10 border-indigo-500 ring-1 ring-indigo-500/50" : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20"}`}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-medium">{opt}</span>
                      <div className={`w-5 h-5 rounded-full border ${answers[current] === opt ? "bg-indigo-500" : "border-white/10"}`} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className=" flex items-center justify-between">
             <button onClick={() => setCurrent(Math.max(0, current - 1))} className={`text-slate-500 font-black text-[10px] uppercase tracking-widest ${current === 0 ? 'invisible' : ''}`}>Back</button>
             {current === questions.length - 1 ? (
                <button onClick={handleSubmit} className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Submit Quiz</button>
             ) : (
                <button onClick={() => setCurrent(current + 1)} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Next</button>
             )}
          </div>
        </main>
        <aside className="bg-white/[0.03] border border-white/10 p-6 rounded-[2rem] h-fit">
            <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-500 mb-6">Navigation</h3>
            <div className="grid grid-cols-4 gap-3">
                {questions.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrent(idx)} className={`h-11 rounded-xl text-[10px] font-black border ${current === idx ? "bg-indigo-500 border-indigo-500" : answers[idx] ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : "bg-white/[0.02] border-white/5 text-slate-600"}`}>{idx + 1}</button>
                ))}
            </div>
        </aside>
      </div>

      <ProctoringEngine onLock={reportLock} onCameraError={setCameraError} />
    </div>
  );
}