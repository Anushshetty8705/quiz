"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import SocialButtons from "./SocialButtons";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleLogin = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
          
    try {
      toast.loading("Authenticating...");
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      toast.dismiss();
      
      if (data.success) {
        toast.success("Welcome back! 🎉");
        router.push(`/${data.id}`);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-6 text-white/90">Sign In</h2>

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <div className={`relative flex items-center transition-all ${errors.email ? 'text-rose-400' : 'text-slate-400 focus-within:text-indigo-400'}`}>
            <Mail className="absolute left-4" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border transition-all outline-none text-sm ${
                errors.email 
                ? "border-rose-500/50 bg-rose-500/5" 
                : "border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.07]"
              } text-white placeholder-slate-500`}
            />
          </div>
          {errors.email && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-rose-400 text-[11px] font-medium ml-2 uppercase tracking-wider">
              <AlertCircle size={12} /> {errors.email}
            </motion.p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className={`relative flex items-center transition-all ${errors.password ? 'text-rose-400' : 'text-slate-400 focus-within:text-indigo-400'}`}>
            <Lock className="absolute left-4" size={18} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border transition-all outline-none text-sm ${
                errors.password 
                ? "border-rose-500/50 bg-rose-500/5" 
                : "border-white/10 focus:border-indigo-500/50 focus:bg-white/[0.07]"
              } text-white placeholder-slate-500`}
            />
          </div>
          {errors.password && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1 text-rose-400 text-[11px] font-medium ml-2 uppercase tracking-wider">
              <AlertCircle size={12} /> {errors.password}
            </motion.p>
          )}
        </div>

        <div className="flex justify-end pr-1">
          <Link href="/forgot-password" size={18} className="text-xs font-semibold text-slate-500 hover:text-indigo-400 transition">
            Forgot Password?
          </Link>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogin}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 mt-2"
        >
          Continue <ArrowRight size={18} />
        </motion.button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-slate-600">
            <span className="bg-[#0b0b0b] px-3 py-1 rounded-full">Or Social Login</span>
          </div>
        </div>

        <SocialButtons />
      </div>
    </div>
  );
}