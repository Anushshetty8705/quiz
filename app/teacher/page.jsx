"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function TeacherPanel() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState("");

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const data = { question, options, answer };
    console.log("Question Saved:", data);
    alert("Question Saved (Check Console)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-6"
      >
        👩‍🏫 Teacher Dashboard
      </motion.h1>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4">Create New Question</h2>

        {/* Question Input */}
        <input
          type="text"
          placeholder="Enter question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-black/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Options */}
        {options.map((opt, i) => (
          <input
            key={i}
            type="text"
            placeholder={`Option ${String.fromCharCode(65 + i)}`}
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
            className="w-full p-3 mb-3 rounded-lg bg-black/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        ))}

        {/* Correct Answer */}
        <input
          type="text"
          placeholder="Correct Answer (A/B/C/D)"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-full p-3 mb-4 rounded-lg bg-black/50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition"
        >
          Save Question
        </button>
      </motion.div>
    </div>
  );
}