"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ShieldCheck, Settings, Trash2, Edit3, Save, X } from "lucide-react";

export default function Profile({ teacherName }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: teacherName,
    department: "Academic Affairs",
  });

  const handleDeleteAccount = () => {
    const confirmed = confirm("Are you absolutely sure? This will delete all your quizzes and student data permanently.");
    if (confirmed) {
      console.log("Deleting account for:", teacherName);
      // Add your API call here: await fetch('/api/teacher/delete', { method: 'DELETE' })
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saving new info:", formData);
    // Add your API call here to update the teacher profile
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-3xl mx-auto pb-20"
    >
      <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-10 pb-10 border-b border-white/5">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-tr from-indigo-500 to-purple-600 p-[3px] shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full rounded-[1.8rem] bg-[#050505] flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
            </div>
            <div>
              {isEditing ? (
                <input 
                  className="bg-white/5 border border-indigo-500/30 text-3xl font-black text-white tracking-tighter capitalize rounded-xl px-3 py-1 outline-none focus:ring-2 ring-indigo-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <h3 className="text-3xl font-black text-white tracking-tighter capitalize">
                  {formData.name}
                </h3>
              )}
              <p className="text-indigo-400 font-bold text-sm tracking-wide mt-1">
                verified_instructor_id: {teacherName}
              </p>
            </div>
          </div>

          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
              isEditing ? "bg-emerald-500 text-white shadow-emerald-500/20 shadow-lg" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
          >
            {isEditing ? <><Save size={14} /> Save Changes</> : <><Edit3 size={14} /> Edit Info</>}
          </button>
        </div>

        {/* DETAILS SECTION */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">
                Account Role
              </label>
              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3 opacity-60">
                <ShieldCheck size={18} className="text-emerald-500" />
                <span className="text-sm font-bold text-white">Administrator</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 ml-1">
                Department
              </label>
              {isEditing ? (
                <input 
                  className="w-full bg-white/5 border border-indigo-500/30 p-4 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-500"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                />
              ) : (
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                  <Settings size={18} className="text-slate-400" />
                  <span className="text-sm font-bold text-white">{formData.department}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DANGER ZONE */}
        <div className="mt-12 pt-10 border-t border-rose-500/10">
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-rose-500 font-black uppercase tracking-widest text-xs mb-1">Danger Zone</h4>
              <p className="text-slate-500 text-sm font-medium">Permanently remove your account and all associated quiz data.</p>
            </div>
            <button 
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-rose-500/20"
            >
              <Trash2 size={14} /> Delete Account
            </button>
          </div>
        </div>

        {/* CANCEL EDITING OVERLAY */}
        {isEditing && (
           <button 
            onClick={() => setIsEditing(false)}
            className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
           >
             <X size={20} />
           </button>
        )}
      </div>
    </motion.div>
  );
}