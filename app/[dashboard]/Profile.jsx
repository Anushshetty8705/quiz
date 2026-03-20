"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from 'sweetalert2';
import {
  User,
  Settings,
  Trash2,
  Edit3,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Profile({
  teacherName,
  dashboard,
  department,
  onupdate,
  setTeacherName,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [formData, setFormData] = useState({
    name: teacherName || "",
    department: department || "",
    newPassword: "",
    confirmPassword: "",
    ForgotPassword: false,
  });

  // Keep state in sync with props
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: teacherName,
      department: department,
    }));
  }, [teacherName, department]);

  const handleDeleteAccount = async () => {
   const confirmed = await Swal.fire({
    title: 'Are you sure?',
    text: "This will delete all your quizzes permanently!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444', // rose-500
    cancelButtonColor: '#6366f1',  // indigo-500
    confirmButtonText: 'Yes, delete it!',
    background: '#1a1a1a',
    color: '#ffffff'
  });
    if (confirmed.isConfirmed) {
      const loadingToast = toast.loading("Deleting account...");
      try {
        const res = await fetch("/api/delete-account", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dashboard }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Your account has been deleted.");
          // Redirect user or logout here
          window.location.href = "/";
        } else {
          toast.error(data.message || "Failed to delete");
        }
      } catch (err) {
        console.error("Error deleting account:", err);
        toast.error("Failed to delete account. Try again later.");
      } finally {
        toast.dismiss(loadingToast);
      }
    }
  };

  const handleSave = async () => {
    // Validation
    if (showPasswordFields) {
      if (!formData.newPassword || !formData.confirmPassword) {
        return toast.error("Password fields are required");
      }
      if (formData.newPassword !== formData.confirmPassword) {
        return toast.error("Passwords do not match!");
      }
      if (formData.newPassword.length < 6) {
        return toast.error("Password must be at least 6 characters");
      }
    }

    const loadingToast = toast.loading("Updating profile...");

    try {
      const res = await fetch("/api/update-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dashboard, formData }),
      });

      const data = await res.json();

      if (data.success) {
        if (onupdate) await onupdate;
        setTeacherName(formData.name);
        setIsEditing(false);
        setShowPasswordFields(false);
        setFormData((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
          ForgotPassword: false,
        }));
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 pb-20"
    >
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 pb-10 border-b border-white/5">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.8rem] md:rounded-[2rem] bg-gradient-to-tr from-indigo-500 to-purple-600 p-[3px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full rounded-[1.6rem] md:rounded-[1.8rem] bg-[#050505] flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
            </div>
            <div>
              {isEditing ? (
                <input
                  className="bg-white/5 border border-indigo-500/30 text-2xl md:text-3xl font-black text-white tracking-tighter capitalize rounded-xl px-3 py-1 outline-none focus:ring-2 ring-indigo-500 w-full max-w-xs"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              ) : (
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter capitalize">
                  {formData.name}
                </h3>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setShowPasswordFields(false);
                  setFormData({
                    name: teacherName,
                    department: department,
                    newPassword: "",
                    confirmPassword: "",
                    ForgotPassword: false,
                  });
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            )}
            <button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                isEditing
                  ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg"
                  : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {isEditing ? (
                <>
                  <Save size={14} /> Save Profile
                </>
              ) : (
                <>
                  <Edit3 size={14} /> Edit Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">
                Department / Faculty
              </label>
              <div
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isEditing ? "bg-white/5 border-indigo-500/40" : "bg-white/[0.02] border-white/5"}`}
              >
                <Settings size={18} className="text-slate-400" />
                <input
                  disabled={!isEditing}
                  className="bg-transparent w-full text-sm font-bold text-white outline-none disabled:cursor-not-allowed"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
              {!showPasswordFields ? (
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowPasswordFields(true);
                    setFormData({ ...formData, ForgotPassword: true });
                  }}
                  className="flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-white/20 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-400 transition-all text-xs font-bold uppercase tracking-widest"
                >
                  <Lock size={14} /> Change Account Password
                </button>
              ) : (
                <div className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-500 ml-1 mb-3">
                  Security Settings Active
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showPasswordFields && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
              >
                <div className="space-y-3 relative">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      className="w-full bg-white/5 border border-indigo-500/30 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-500"
                      placeholder="••••••••"
                      value={formData.newPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newPassword: e.target.value,
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">
                    Confirm Password
                  </label>
                  <input
                    type={showPass ? "text" : "password"}
                    className="w-full bg-white/5 border border-indigo-500/30 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-500"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DANGER ZONE */}
        <div className="mt-12 pt-10 border-t border-rose-500/10">
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2rem] p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-center lg:text-left">
              <h4 className="text-rose-500 font-black uppercase tracking-widest text-xs mb-1">
                Danger Zone
              </h4>
              <p className="text-slate-500 text-sm font-medium">
                Permanently remove your account and all associated quiz data.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="w-full lg:w-auto flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-rose-500/20"
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
