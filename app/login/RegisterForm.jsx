"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import SocialButtons from "./SocialButtons";
import { Eye, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
export default function RegisterForm() {
  const [step, setStep] = useState("register");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [editEmail, setEditEmail] = useState(false);

  // Validate
  const validate = () => {
    let err = {};
    if (!form.name.trim()) err.name = "Name required";
    if (!form.email.trim()) err.email = "Email required";
    if (!form.password.trim()) err.password = "Password required";
    else if (form.password.length < 6) err.password = "Min 6 chars";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Send OTP
  const handleSendOTP = async () => {
    if (!validate()) return;

    await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: form.email }),
    });

    toast.success("OTP Sent");
    setStep("otp");
  };

  // OTP Input Change
  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) otpRefs.current[index + 1].focus();
  };

  // Backspace Focus Previous
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };
const router = useRouter();
  // ✅ Verify OTP & Register User
  const verifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return toast.error("Enter full OTP");

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp: otpValue, email: form.email }),
    });

    const data = await res.json();

    if (!data.success) return toast.error("Invalid OTP");

    toast.success("OTP Verified");

    // REGISTER USER
    const registerRes = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const registerData = await registerRes.json();
console.log("Register Response:", registerData);
    if (registerData.success) {
      toast.success("Registration Successful 🎉");
      router.push(`/${registerData.id}`);
      setOtpVerified(true);
    } else {
      toast.error(registerData.message);
    }
  };

  // ✅ Resend OTP + Allow Email Change
  const handleResendOTP = async () => {
    setEditEmail(true);
    setOtp(["", "", "", "", "", ""]);
    otpRefs.current[0].focus();
  };

  // Send OTP again after email change
  const resendWithNewEmail = async () => {
    await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ email: form.email }),
    });

    toast.success("OTP sent to " + form.email);
    setEditEmail(false);
  };

  return (
    <>
      <Toaster />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/20 backdrop-blur-lg p-6 rounded-xl text-white max-w-md"
      >
        {/* REGISTER FORM */}
        {step === "register" && (
          <>
            <h2 className="text-xl font-bold text-center">Teacher Register</h2>

            <input
              placeholder="Name"
              className="w-full p-2 mt-2 bg-white/20 border rounded"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <p className="text-red-400">{errors.name}</p>}

            <input
              placeholder="Email"
              className="w-full p-2 mt-2 bg-white/20 border rounded"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <p className="text-red-400">{errors.email}</p>}

            {/* Password */}
            <div className="relative mt-2">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                className="w-full p-2 bg-white/20 border rounded pr-8"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2 top-2"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400">{errors.password}</p>}

            <button
              onClick={handleSendOTP}
              className="w-full bg-blue-600 mt-3 py-2 rounded"
            >
              Send OTP
            </button>

            <SocialButtons />
          </>
        )}

        {/* OTP FORM */}
        {step === "otp" && (
          <>
            <h2 className="text-lg font-bold text-center">Verify OTP</h2>

            {/* Change Email Input */}
            {editEmail && (
              <div className="mt-2">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full p-2 border rounded text-black"
                  placeholder="Enter correct email"
                />
                <button
                  onClick={resendWithNewEmail}
                  className="w-full bg-purple-600 mt-2 py-1 rounded"
                >
                  Send OTP to New Email
                </button>
              </div>
            )}

            <div className="flex gap-2 justify-center mt-3">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKeyDown(e, i)}
                  className="w-10 h-10 text-center border rounded bg-white text-black font-bold"
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              className="w-full bg-green-600 mt-3 py-2 rounded"
            >
              Verify OTP & Register
            </button>

            <p
              onClick={handleResendOTP}
              className="text-center mt-2 text-sm cursor-pointer underline"
            >
              Wrong Email? Change & Resend OTP
            </p>

            {!otpVerified && (
              <p className="text-red-400 text-sm text-center mt-2">
                OTP must be verified to register
              </p>
            )}
          </>
        )}
      </motion.div>
    </>
  );
}