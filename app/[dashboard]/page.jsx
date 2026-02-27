"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeacherDashboard() {
  const { dashboard } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch(
          `/api/teacher-quiz?teacherId=${dashboard}`
        );
        const data = await res.json();

        if (data.success) {
          setQuizzes(data.quizzes); // ✅ array
        }
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      }
    };

    if (dashboard) fetchQuizzes();
  }, [dashboard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white p-6">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4"
      >
        <h1 className="text-3xl font-bold tracking-wide">
          👨‍🏫 Teacher Dashboard
        </h1>

        <Link href={`/${dashboard}/create-quiz`}>
          <button className="bg-indigo-600 px-6 py-2 rounded-2xl font-semibold hover:bg-indigo-700 transition shadow-lg hover:scale-105">
            ➕ Create Quiz
          </button>
        </Link>
      </motion.div>

      {/* Quizzes Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <motion.div
            key={quiz._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-xl hover:scale-105 transition"
          >
            <h2 className="text-2xl font-bold mb-2">
              {quiz.subjectCode}
            </h2>

            <p className="text-gray-300 mb-1">
              <span className="font-semibold">Code:</span> {quiz.quizCode}
            </p>
              <p className="text-gray-300 mb-1">
              <span className="font-semibold">Status:</span> {quiz.isLocked ? "🔒 Locked" : "🔓 Unlocked"}
            </p>

            <p className="text-gray-300 mb-4">
              <span className="font-semibold">Students:</span>{" "}
              {quiz.studentCount } 
            </p>

            <Link href={`/${dashboard}/${quiz.quizCode}`}>
              <button className="bg-indigo-600 px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition w-full">
                View Quiz
              </button>
            </Link>
          </motion.div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <p className="text-center text-gray-400 mt-10">
          No quizzes created yet.
        </p>
      )}
    </div>
  );
}