"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">

      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-center"
      >
        Online Quiz Platform
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm sm:text-lg text-center max-w-xl mb-6"
      >
        Teachers can create quizzes and track students. Students can attend quizzes securely.
      </motion.p>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Link href="/login">
          <button className="bg-white text-indigo-600 px-6 py-2 rounded font-semibold w-full sm:w-auto">
            Teacher Login
          </button>
        </Link>
<Link href="/join-quiz">
          <button className="bg-black px-6 py-2 rounded font-semibold w-full sm:w-auto">
            join Quiz
          </button>
        </Link>
      </motion.div>

    </div>
  );
}