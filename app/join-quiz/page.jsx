"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function StudentQuizAccess() {
  const router = useRouter();

  const [subjectCode, setSubjectCode] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    if (!subjectCode || !quizCode) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/quiz/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectCode,
          quizCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Quiz found!");

        // Navigate to quiz page using quizCode
        router.push(`/join-quiz/${quizCode}/student-info`);
      } else {
        toast.error(data.message || "Invalid quiz details");
      }

    } catch (error) {
      toast.error("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4 text-white">
      
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Enter Quiz Details
        </h2>

        <input
          placeholder="Subject Code"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          className="w-full p-3 mb-3 rounded bg-white/20 border border-white/30 outline-none"
        />

        <input
          placeholder="Quiz Password"
          type="text"
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-white/20 border border-white/30 outline-none"
        />

        <button
          onClick={startQuiz}
          disabled={loading}
          className="w-full bg-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          {loading ? "Checking..." : "Start Quiz"}
        </button>
      </motion.div>
    </div>
  );
}