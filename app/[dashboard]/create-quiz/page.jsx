"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, Save, Copy, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react";
import { nanoid } from "nanoid";
import toast, { Toaster } from "react-hot-toast";

export default function CreateQuiz() {
  const { dashboard } = useParams();
  const router = useRouter();
  const [quizCode] = useState(nanoid(8));
  const [subjectCode, setSubjectCode] = useState("");

  const [questions, setQuestions] = useState([
    { id: nanoid(), question: "", options: ["", "", "", ""], correct: 0 }
  ]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: nanoid(), question: "", options: ["", "", "", ""], correct: 0 }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return toast.error("At least one question is required");
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index, value) => {
    const newQ = [...questions];
    newQ[index].question = value;
    setQuestions(newQ);
  };

  const updateOption = (qIndex, oIndex, value) => {
    const newQ = [...questions];
    newQ[qIndex].options[oIndex] = value;
    setQuestions(newQ);
  };

  const setCorrectAnswer = (qIndex, oIndex) => {
    const newQ = [...questions];
    newQ[qIndex].correct = oIndex;
    setQuestions(newQ);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizCode);
    toast.success("Quiz code copied!");
  };

  const saveQuiz = async () => {
    if (!subjectCode) return toast.error("Please enter subject code");
    
    // Simple validation
    const isValid = questions.every(q => q.question && q.options.every(opt => opt !== ""));
    if (!isValid) return toast.error("Please fill all questions and options");

    try {
      const response = await fetch("/api/quiz/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectCode,
          quizCode,
          questions,
          teacherId: dashboard,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Quiz created successfully!");
        setTimeout(() => router.push(`/${dashboard}`), 1500);
      } else {
        toast.error(data.message || "Failed to save");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 pb-20">
      <Toaster 
        toastOptions={{
          style: { background: '#1e1b4b', color: '#fff', border: '1px solid #3730a3' }
        }} 
      />

      {/* STICKY HEADER */}
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={20} /> <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Create Assessment
          </h1>

          <button
            onClick={saveQuiz}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold transition shadow-lg shadow-indigo-600/20"
          >
            <Save size={18} /> Publish
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-10">
        
        {/* QUIZ CONFIG */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Subject Title</label>
            <input
              placeholder="e.g. Advanced Mathematics"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition text-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 ml-1">Invite Code</label>
            <div className="relative group">
              <input
                className="w-full p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 outline-none text-indigo-400 font-mono font-bold"
                readOnly
                value={quizCode}
              />
              <button
                type="button"
                onClick={copyToClipboard}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* QUESTIONS LIST */}
        <div className="space-y-8">
          <AnimatePresence>
            {questions.map((q, qIndex) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 shadow-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-indigo-500/10 text-indigo-400 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                    Question {qIndex + 1}
                  </span>
                  <button 
                    onClick={() => removeQuestion(qIndex)}
                    className="text-slate-500 hover:text-rose-500 transition p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <textarea
                  placeholder="What would you like to ask?"
                  value={q.question}
                  rows={2}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 pb-2 text-xl outline-none focus:border-indigo-500 transition resize-none mb-8"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  {q.options.map((opt, oIndex) => (
                    <div 
                      key={oIndex} 
                      className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${
                        q.correct === oIndex 
                        ? "bg-emerald-500/10 border-emerald-500/40" 
                        : "bg-white/5 border-transparent hover:border-white/10"
                      }`}
                    >
                      <button
                        onClick={() => setCorrectAnswer(qIndex, oIndex)}
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition ${
                          q.correct === oIndex ? "bg-emerald-500 text-black" : "bg-white/10 text-slate-500"
                        }`}
                      >
                        {q.correct === oIndex ? <CheckCircle2 size={16} /> : oIndex + 1}
                      </button>

                      <input
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className="bg-transparent flex-1 outline-none text-sm py-2"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* BOTTOM ACTION */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addQuestion}
          className="mt-10 w-full py-10 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center gap-3 text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group"
        >
          <div className="p-4 bg-white/5 rounded-full group-hover:bg-indigo-500/20 transition">
            <PlusCircle size={32} />
          </div>
          <span className="font-bold tracking-tight">Add Another Question</span>
        </motion.button>

      </main>
    </div>
  );
}