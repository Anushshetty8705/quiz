"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react"

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

  /* =========================
     🚫 DISABLE COPY / PASTE
  ==========================*/
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

  /* =========================
     🔒 REPORT LOCK
  ==========================*/
  const reportLockToBackend = async (lockReason) => {
    try {
      await fetch("/api/quiz-locked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, quizId, reason: lockReason }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  /* =========================
     🔍 CHECK STATUS
  ==========================*/
  useEffect(() => {
    const checkStatus = async () => {
      const res = await fetch(
        `/api/check-student?studentId=${studentId}&quizId=${quizId}`
      );
      const data = await res.json();

      if (!data.success) return;
if(!data.student.submitted) {if (data.student.locked) {
        setLocked(true);
        setReason(data.student.lockedReason);
      }}
      

      if (data.student.submitted) {
        setShowResult(true);
        setScore(data.student.score);
      }
    };

    if (studentId && quizId) checkStatus();
  }, [studentId, quizId]);

  /* =========================
     🔒 TAB SWITCH LOCK
  ==========================*/
 useEffect(() => {
  if (showResult) return; // ❌ Do nothing if quiz is submitted

  const handleVisibility = async () => {
    if (document.hidden) {
      const message = "Tab switching detected!";
      setLocked(true);
      setReason(message);
      await reportLockToBackend(message);
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };

}, [showResult]);

  /* =========================
     ⏳ TIMER
  ==========================*/
  useEffect(() => {
    if (timeLeft <= 0) {
      const message = "Time is over!";
      setLocked(true);
      setReason(message);
      reportLockToBackend(message);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* =========================
     📥 FETCH QUESTIONS
  ==========================*/
  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch(`/api/questions?quizid=${quizId}`);
      const data = await res.json();
      if (data.success) setQuestions(data.questions);
    };

    if (quizId) fetchQuestions();
  }, [quizId]);

  /* =========================
     📤 SUBMIT
  ==========================*/
  const handleSubmit = async () => {
    let total = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correct) total++;
    });

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

  /* =========================
     🔒 LOCK SCREEN
  ==========================*/
  if (locked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-black to-black text-white px-6 relative overflow-hidden">

      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-red-600/20 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-96 h-96 bg-red-500/10 blur-3xl rounded-full bottom-10 right-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl p-10 md:p-14 rounded-3xl text-center border border-red-500/50 shadow-2xl max-w-md w-full"
      >

        {/* Animated Warning Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex justify-center mb-6"
        >
          <AlertTriangle className="text-red-500 w-16 h-16" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-red-400 mb-4 tracking-wide">
          🚫 Quiz Locked
        </h1>

        {/* Reason */}
        <p className="text-gray-300 mb-6 text-lg">
          {reason}
        </p>
        <p className="text-gray-300 mb-6 text-lg">To Unlock contact your teacher</p>

      </motion.div>
    </div>
    );
  }

  /* =========================
     🏆 RESULT
  ==========================*/
  if (showResult) {
    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-green-900 to-black text-white px-6 relative overflow-hidden">

  {/* Glow Background Effect */}
  <div className="absolute w-96 h-96 bg-green-500/20 blur-3xl rounded-full top-20 left-20"></div>
  <div className="absolute w-96 h-96 bg-emerald-400/20 blur-3xl rounded-full bottom-20 right-20"></div>

  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center relative z-10"
  >

    {/* Title */}
    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-wide bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
      🎉 Quiz Completed
    </h1>

    <p className="text-gray-300 mb-10 text-lg">
      Great effort! Here’s your performance
    </p>

    {/* Score Card */}
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-72 h-72 mx-auto flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-green-400 shadow-2xl"
    >

      {/* Inner Circle */}
      <div className="absolute w-60 h-60 rounded-full border-4 border-green-500/30"></div>

      {/* Score Text */}
      <div className="text-center">
        <p className="text-gray-300 text-sm mb-2">Your Score</p>

        <p className="text-6xl font-extrabold text-green-400">
          {score}
        </p>

        <p className="text-gray-400 text-lg">
          out of {questions.length}
        </p>
      </div>

    </motion.div>

    {/* Performance Message */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="mt-10 text-xl font-semibold text-green-300"
    >
      {score === questions.length
        ? "🏆 Perfect Score!"
        : score > questions.length / 2
        ? "👏 Well Done!"
        : "💪 Keep Practicing!"}
    </motion.p>

  </motion.div>
</div>
    );
  }

  if (!questions.length) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >

        {/* Animated Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-16 h-16 border-4 border-gray-700 border-t-green-400 rounded-full mx-auto mb-6"
        />

        {/* Loading Text */}
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-xl font-semibold tracking-wide"
        >
          Loading Questions...
        </motion.p>

        {/* Sub text */}
        <p className="text-gray-400 mt-2 text-sm">
          Please wait while we prepare your quiz
        </p>

      </motion.div>
    </div>
    );
  }

  const question = questions[current];

  return (
    <div className="min-h-screen select-none bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-white border border-white/20"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Quiz Examination</h1>
          <div className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl font-semibold">
            ⏳ {formatTime()}
          </div>
        </div>

        {/* PROGRESS */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-6">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${((current + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        {/* QUESTION */}
        <h2 className="text-lg font-semibold mb-6">
          Q{current + 1}. {question.question}
        </h2>

        {/* OPTIONS */}
        <div className="space-y-4">
          {question.options.map((opt, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                setAnswers({ ...answers, [current]: i })
              }
              className={`p-4 rounded-xl cursor-pointer border transition-all duration-300
                ${
                  answers[current] === i
                    ? "bg-indigo-600 border-indigo-400"
                    : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
            >
              {opt}
            </motion.div>
          ))}
        </div>

        {/* BUTTON */}
        <div className="mt-8 flex justify-end">
          {current === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold shadow-lg transition"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrent(current + 1)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold shadow-lg transition"
            >
              Next →
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}