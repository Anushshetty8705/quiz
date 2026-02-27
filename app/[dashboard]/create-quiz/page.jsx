"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { PlusCircle, Save, Copy } from "lucide-react";
import { nanoid } from "nanoid";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CreateQuiz() {

  const { dashboard } = useParams(); // ✅ correct way
  const id = dashboard;
const router = useRouter();
  const [quizCode] = useState(nanoid(8));
  const [subjectCode, setSubjectCode] = useState("");

  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correct: 0 }
    ]);
  };

  const updateQuestion = (qIndex, field, value) => {
    const newQ = [...questions];
    newQ[qIndex][field] = value;
    setQuestions(newQ);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = value;
    setQuestions(newQ);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizCode);
    toast.success("Quiz code copied!");
  };

  const saveQuiz = async () => {
    if (!subjectCode) {
      toast.error("Please enter subject code");
      return;
    }

    try {
      const response = await fetch("/api/quiz/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectCode,
          quizCode,
          questions,
          teacherId: id, // ✅ sending dashboard id
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Quiz saved successfully!");
      setTimeout(() => {
    router.push(`/${id}`);
  }, 1000);// ✅ navigate to quiz page using returned id from API
      } else {
        toast.error(data.message || "Failed to save quiz");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black text-white p-6 flex justify-center">
      
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
      >
        <h2 className="text-3xl font-bold text-center mb-6">
          📝 Create New Quiz
        </h2>

        {/* Subject + Quiz Code */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <input
            placeholder="Subject Code (e.g CS101)"
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/20 border border-white/30 outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />

          <div className="relative">
            <input
              className="w-full p-3 pr-12 rounded-xl bg-white/20 border border-white/30 outline-none focus:ring-2 focus:ring-purple-500 transition"
              readOnly
              value={quizCode}
            />

            <button
              type="button"
              onClick={copyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-purple-400 transition"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, qIndex) => (
          <motion.div
            key={qIndex}
            className="bg-white/10 p-6 rounded-2xl mb-6 border border-white/20"
          >
            <h3 className="font-semibold text-lg mb-3">
              Question {qIndex + 1}
            </h3>

            <input
              placeholder="Enter question"
              value={q.question}
              className="w-full p-3 mb-4 rounded-xl bg-white/20 border border-white/30 outline-none"
              onChange={(e) =>
                updateQuestion(qIndex, "question", e.target.value)
              }
            />

            {q.options.map((opt, oIndex) => (
              <div key={oIndex} className="flex items-center gap-3 mb-3">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correct === oIndex}
                  className="accent-indigo-500"
                  onChange={() =>
                    updateQuestion(qIndex, "correct", oIndex)
                  }
                />

                <input
                  placeholder={`Option ${oIndex + 1}`}
                  value={opt}
                  className="flex-1 p-2 rounded-lg bg-white/20 border border-white/30 outline-none"
                  onChange={(e) =>
                    updateOption(qIndex, oIndex, e.target.value)
                  }
                />
              </div>
            ))}
          </motion.div>
        ))}

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <button
            onClick={addQuestion}
            className="flex items-center justify-center gap-2 w-full bg-purple-600 py-3 rounded-2xl font-semibold hover:bg-purple-700 transition"
          >
            <PlusCircle size={20} />
            Add Question
          </button>

          <button
            onClick={saveQuiz}
            className="flex items-center justify-center gap-2 w-full bg-indigo-600 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition"
          >
            <Save size={20} />
            Save Quiz
          </button>
        </div>
      </motion.div>
    </div>
  );
}