"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useParams } from "next/navigation";

export default function StudentInfo() {
  const router = useRouter();
const { quiz } = useParams();
const quizid=quiz
  const [form, setForm] = useState({
    name: "",
    regNo: "",
    email: "",
  });
;
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.regNo || !form.email) {
      toast.error("All fields are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/student-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...form, quizid}),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Registered successfully!");

        // Navigate after success
        setTimeout(() => {
          router.push(`/join-quiz/${quiz}/${data.id}`);
        }, 1000);

      } else {
        toast.error(data.message);
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
        <h2 className="text-2xl font-bold text-center mb-4">
          Student Details
        </h2>

        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className="w-full p-3 mb-3 rounded bg-white/20 border border-white/30 outline-none"
        />

        <input
          name="regNo"
          placeholder="Registration Number"
          onChange={handleChange}
          className="w-full p-3 mb-3 rounded bg-white/20 border border-white/30 outline-none"
        />

        <input
          name="email"
          type="email"
          placeholder="Email ID"
          onChange={handleChange}
          className="w-full p-3 mb-4 rounded bg-white/20 border border-white/30 outline-none"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
        >
          {loading ? "Registering..." : "Continue to Quiz"}
        </button>

      </motion.div>
    </div>
  );
}