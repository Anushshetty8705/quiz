"use client";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SocialButtons() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const saveSocialUser = async () => {
        try {
          const toastId = toast.loading("Syncing profile...", {
            style: { background: "#0f172a", color: "#fff" },
          });

          const res = await fetch("/api/social-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name || "SocialUser",
              Authprovider: "google github", // Cleaned up providers
            }),
          });

          const data = await res.json();
          toast.dismiss(toastId);

          if (res.ok && data.error === false) {
            toast.success(`Welcome, ${session.user.name.split(" ")[0]}!`, {
              icon: "🚀",
              style: { background: "#0f172a", color: "#fff" },
            });
            router.push(`/${data.id}`);
          } else {
            signOut();
            toast.error(data.message || "Access denied ❌");
          }
        } catch (err) {
          console.error("Error saving user:", err);
          toast.error("Network error ❌");
        }
      };

      saveSocialUser();
    }
  }, [status, session, router]);

  return (
    <div className="flex gap-4 mt-2">
      {/* Google Button */}
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => signIn("google")}
        className="flex items-center justify-center gap-3 flex-1 bg-white/[0.04] border border-white/10 text-white py-3 rounded-2xl transition-colors duration-300"
      >
        <div className="bg-white p-1 rounded-full">
            <FaGoogle className="text-red-500 text-xs" />
        </div>
        <span className="text-sm font-bold tracking-tight">Google</span>
      </motion.button>

      {/* GitHub Button */}
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
        whileTap={{ scale: 0.98 }}
        onClick={() => signIn("github")}
        className="flex items-center justify-center gap-3 flex-1 bg-white/[0.04] border border-white/10 text-white py-3 rounded-2xl transition-colors duration-300"
      >
        <FaGithub className="text-lg text-white" />
        <span className="text-sm font-bold tracking-tight">GitHub</span>
      </motion.button>
    </div>
  );
}