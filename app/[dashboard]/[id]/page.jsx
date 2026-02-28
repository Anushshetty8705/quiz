"use client";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Leaderboard from "./Leaderboard";
import ScoreGraph from "./ScoreGraph";
import MalpracticeList from "./MalpracticeList";
import { useEffect, useState } from "react";

export default function QuizDetails() {
  const { id, dashboard } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    let interval;

    const fetchQuiz = async () => {
      try {
        const res = await fetch(
          `/api/quiz-details?teacherId=${dashboard}&quizId=${id}`,
          { cache: "no-store" }
        );

        const data = await res.json();

        if (data.success) {
          const studentsData = data.quizzedetails || [];

          setStudents(studentsData);
          setIsLocked(data.isLocked);

          const studentCount = studentsData.length;

          const totalScore = studentsData.reduce(
            (acc, curr) => acc + (curr.score || 0),
            0
          );

          const averageScore =
            studentCount > 0 ? totalScore / studentCount : 0;

          setQuiz({
            quizId: id,
            quizCode: data.coursecode,
            studentCount,
            averageScore,
          });
        }
      } catch (err) {
        console.error("Failed to fetch quiz", err);
      } finally {
        setLoading(false);
      }
    };

    if (dashboard && id) {
      fetchQuiz();
      interval = setInterval(fetchQuiz, 2000);
    }
    return () => clearInterval(interval);
  }, [id, dashboard]);




  const toggleQuizLock = async () => {
    try {
      const res = await fetch("/api/toggle-quiz-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId: dashboard,
          quizId: id,
          lock: !isLocked,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsLocked(!isLocked);
      }
    } catch (err) {
      console.error("Failed to toggle lock", err);
    }
  };

  if (loading) return <div className="text-white p-6">Loading...</div>;
  if (!quiz) return <div className="text-white p-6">Quiz Not Found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white p-6">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold tracking-wide">
          📘 {quiz.quizCode} Dashboard
        </h1>

        <button
          onClick={toggleQuizLock}
          className={`px-5 py-2 rounded-lg mt-4 font-semibold transition ${
            isLocked
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {isLocked ? "Unlock Quiz" : "Lock Quiz"}
        </button>
      </motion.div>

      {/* INFO CARDS */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <InfoCard title="Quiz Code" value={id} color="text-indigo-400" />
        <InfoCard title="Total Students" value={quiz.studentCount} color="text-green-400" />
        <InfoCard title="Average Score" value={quiz.averageScore.toFixed(2)} color="text-yellow-400" />
      </div>

      {/* ANALYTICS */}
      <div className="grid lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl">
          <h2 className="text-xl font-semibold mb-6">🏆 Leaderboard</h2>
          <Leaderboard students={students} />
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl">
          <h2 className="text-xl font-semibold mb-6">📊 Score Distribution</h2>
          <ScoreGraph students={students} />
        </div>
      </div>

      {/* MALPRACTICE */}
      <div className="bg-white/10 backdrop-blur-xl border border-red-500/30 p-6 rounded-3xl shadow-xl">
        <h2 className="text-xl font-semibold mb-6 text-red-400">
          🚨 Malpractice Activity
        </h2>
        <MalpracticeList students={students} />
      </div>
    </div>
  );
}

function InfoCard({ title, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-lg"
    >
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );
}