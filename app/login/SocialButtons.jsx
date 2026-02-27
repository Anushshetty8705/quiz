"use client";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function SocialButtons() {
  return (
    <div className="flex gap-3 mt-4">

      {/* Google Button */}
      <button className="flex items-center justify-center gap-2 flex-1 bg-white text-black py-2 rounded-xl shadow-md border hover:bg-gray-100 transition">
        <FaGoogle className="text-red-500 text-lg" />
        <span className="font-medium">Google</span>
      </button>

      {/* GitHub Button */}
      <button className="flex items-center justify-center gap-2 flex-1 bg-gray-900 text-white py-2 rounded-xl shadow-md hover:bg-black transition">
        <FaGithub className="text-lg" />
        <span className="font-medium">GitHub</span>
      </button>

    </div>
  );
}