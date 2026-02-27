"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPage() {
  const [tab, setTab] = useState("login");

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden">

      {/* Blur Background */}
      <div className="absolute w-72 h-72 blur-3xl top-10 left-10 "></div>
      <div className="absolute w-72 h-72  blur-3xl bottom-10 right-10 "></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className=" p-8 rounded-2xl w-full max-w-md text-white"
      >
        {/* Tabs */}
       <div className="relative bg-white/20 rounded-lg p-1 flex mb-6">
  
  <motion.div
    layout
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
    className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-md ${
      tab === "login" ? "left-1" : "left-1/2"
    }`}
  />

  <button
    onClick={() => setTab("login")}
    className="flex-1 py-2 z-10 font-semibold text-indigo-600"
  >
    Login
  </button>

  <button
    onClick={() => setTab("register")}
    className="flex-1 py-2 z-10 font-semibold text-indigo-600"
  >
    Register
  </button>
</div>

        {tab === "login" ? <LoginForm /> : <RegisterForm />}
      </motion.div>
    </div>
  );
}