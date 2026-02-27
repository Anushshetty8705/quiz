"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MalpracticeList({ students }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Simulate fetching malpractice reports from students data
    const malpracticeReports = students.filter((student) => student.locked);
    setReports(malpracticeReports);
  }, [students]);

  console.log("Reports:", reports);

  const handleUnlock = async (studentId, quizId) => {
    try {
      const res = await fetch("/api/unlock-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, quizId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Student unlocked!"); // Refresh list
        setReports(reports.filter((r) => r.id !== studentId));
      } else {
        toast.error("Failed to unlock student");
      }
    } catch (err) {
      toast.error("Server error");
      console.error(err);
    }
  };
  console.log("Malpractice reports:", reports); 

  if (!reports.length)
    return <p className="text-white">No students are flagged for malpractice.</p>;

  return (
   <div className=" p-6 rounded-2xl shadow-2xl  max-h-96 overflow-y-auto">
  
 

  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left text-white border-collapse">
      
      {/* Table Head */}
      <thead className="text-xs uppercase bg-black/40 text-gray-300 sticky top-0 backdrop-blur-md">
        <tr>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Reg No</th>
          <th className="px-6 py-3">Reason</th>
          <th className="px-6 py-3 text-center">Action</th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
        {reports.map((r) => (
          <tr
            key={r.id}
            className="border-b border-white/10 hover:bg-white/5 transition-all duration-200"
          >
            <td className="px-6 py-4 font-semibold">
              {r.name}
            </td>

            <td className="px-6 py-4 text-gray-300">
              {r.regNo}
            </td>

            <td className="px-6 py-4">
              <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs">
                {r.lockedReason}
              </span>
            </td>

            <td className="px-6 py-4 text-center">
              <button
                onClick={() => handleUnlock(r.id, r.quizId)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
              >
                Unlock
              </button>
            </td>
          </tr>
        ))}
      </tbody>

    </table>
  </div>
</div>
  );
}