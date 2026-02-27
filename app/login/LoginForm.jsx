"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    // Clear error when typing
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleLogin = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
          toast.loading("Logging in...");
    try {
      toast.dismiss();
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
console.log("Login response:", data);
      if (data.success) {
        toast.success("Login Successful 🎉");
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="backdrop-blur-lg bg-white/20 border border-white/30 p-8 rounded-2xl shadow-xl w-full max-w-md text-white"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Teacher Login</h2>

      {/* Email */}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        className={`w-full p-3 mb-1 rounded bg-white/20 border ${
          errors.email ? "border-red-500" : "border-white/30"
        } text-white placeholder-gray-200 outline-none`}
      />
      {errors.email && (
        <p className="text-red-400 text-sm mb-2">{errors.email}</p>
      )}

      {/* Password */}
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className={`w-full p-3 mb-1 rounded bg-white/20 border ${
          errors.password ? "border-red-500" : "border-white/30"
        } text-white placeholder-gray-200 outline-none`}
      />
      {errors.password && (
        <p className="text-red-400 text-sm mb-2">{errors.password}</p>
      )}

      <div className="text-right mb-4">
        <Link
          href="/forgot-password"
          className="text-sm text-indigo-200 hover:text-white underline"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        onClick={handleLogin}
        className="w-full bg-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
      >
        Login
      </button>

      <p className="mt-4 text-center text-sm text-gray-200">Or login with</p>
      <SocialButtons />
    </motion.div>
  );
}