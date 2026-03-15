"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, RefreshCcw, AlertCircle } from "lucide-react";
import SocialButtons from "./SocialButtons";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [step, setStep] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const router = useRouter();

  const validate = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Full Name is required";
    if (!form.email.trim()) err.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) err.email = "Invalid email format";
    if (!form.password.trim()) err.password = "Password is required";
    else if (form.password.length < 6) err.password = "Min 6 characters required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSendOTP = async () => {
    if (!validate()) return;
    toast.loading("Sending security code...");
    
    await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: form.email }),
    });

    toast.dismiss();
    toast.success("Security code sent to your inbox");
    setStep("otp");
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return toast.error("Please enter the full 6-digit code");

    toast.loading("Verifying...");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp: otpValue, email: form.email }),
    });

    const data = await res.json();
    if (!data.success) {
      toast.dismiss();
      return toast.error("Invalid verification code");
    }

    const registerRes = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const registerData = await registerRes.json();
    toast.dismiss();

    if (registerData.success) {
      toast.success("Welcome to the platform! 🎉");
      router.push(`/${registerData.id}`);
    } else {
      toast.error(registerData.message);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "register" ? (
          <motion.div
            key="reg-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-bold mb-6 text-white/90">Create Account</h2>
            
            {/* Name Input */}
            <div className="space-y-1">
              <div className="relative flex items-center text-slate-400 focus-within:text-indigo-400 transition-colors">
                <User className="absolute left-4" size={18} />
                <input
                  placeholder="Full Name"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border transition-all outline-none text-sm ${
                    errors.name ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 focus:border-indigo-500/50"
                  } text-white placeholder-slate-500`}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              {errors.name && <p className="text-rose-400 text-[10px] uppercase font-bold tracking-wider ml-2">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <div className="relative flex items-center text-slate-400 focus-within:text-indigo-400 transition-colors">
                <Mail className="absolute left-4" size={18} />
                <input
                  placeholder="Email Address"
                  className={`w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border transition-all outline-none text-sm ${
                    errors.email ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 focus:border-indigo-500/50"
                  } text-white placeholder-slate-500`}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              {errors.email && <p className="text-rose-400 text-[10px] uppercase font-bold tracking-wider ml-2">{errors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="relative flex items-center text-slate-400 focus-within:text-indigo-400 transition-colors">
                <Lock className="absolute left-4" size={18} />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Create Password"
                  className={`w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/[0.03] border transition-all outline-none text-sm ${
                    errors.password ? "border-rose-500/50 bg-rose-500/5" : "border-white/10 focus:border-indigo-500/50"
                  } text-white placeholder-slate-500`}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-[10px] uppercase font-bold tracking-wider ml-2">{errors.password}</p>}
            </div>

            <button
              onClick={handleSendOTP}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 mt-4"
            >
              Verify Identity <ArrowRight size={18} />
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold text-slate-600">
                <span className="bg-[#0b0b0b] px-3 py-1 rounded-full">Or Join With</span>
              </div>
            </div>
            <SocialButtons />
          </motion.div>
        ) : (
          <motion.div
            key="otp-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <div className="inline-flex p-4 bg-indigo-500/10 rounded-full mb-4 text-indigo-400">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verify your email</h2>
            <p className="text-slate-500 text-sm mb-8 px-4">
              We've sent a 6-digit security code to <br/>
              <span className="text-indigo-400 font-medium">{form.email}</span>
            </p>

            <div className="flex gap-2 justify-center mb-8">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-12 h-14 text-center rounded-xl bg-white/[0.03] border border-white/10 text-white font-bold text-xl focus:border-indigo-500/50 focus:bg-white/[0.07] outline-none transition-all"
                />
              ))}
            </div>

            {editEmail ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-2">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/10 text-white text-sm outline-none focus:border-purple-500/50 mb-2"
                  placeholder="Correct your email"
                />
                <button
                  onClick={() => { setEditEmail(false); handleSendOTP(); }}
                  className="w-full bg-purple-600/20 text-purple-400 py-2 rounded-xl text-xs font-bold hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw size={14} /> Resend to new email
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setEditEmail(true)}
                className="text-slate-500 hover:text-indigo-400 text-xs font-medium underline mb-8 block mx-auto"
              >
                Wrong email address? Click to change
              </button>
            )}

            <button
              onClick={verifyOtp}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-600/20"
            >
              Verify & Complete Registration
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}