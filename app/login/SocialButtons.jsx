"use client";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";  
export default function SocialButtons() {
   const { data: session, status } = useSession();

const router = useRouter(); 
    useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      const saveSocialUser = async () => {
        try {
          const toastId = toast.loading("Logging in...");
          const res = await fetch("/api/social-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name || "SocialUser",
              Authprovider: "google facebook github",
            }),
          });
          const data = await res.json();
          toast.dismiss(toastId);

          if (res.ok && data.error === false) {
           
            toast.success("Login successful", { theme: "dark" });
             router.push(`/${data.id}`);
          } else {
            signOut();
            toast.error(data.message || "Failed to save user ❌", {
              theme: "dark",
            });
          }
        } catch (err) {
          console.error("Error saving user:", err);
          toast.error("Server error ❌", { theme: "dark" });
        }
      };

      saveSocialUser();
    }
  }, [status, session, router]);




  return (
    <div className="flex gap-3 mt-4">

      {/* Google Button */}
      <button onClick={() => signIn("google")} className="flex items-center justify-center gap-2 flex-1 bg-white text-black py-2 rounded-xl shadow-md border hover:bg-gray-100 transition">
        <FaGoogle className="text-red-500 text-lg" />
        <span className="font-medium" >Google</span>
      </button>

      {/* GitHub Button */}
      <button onClick={() => signIn("github")} className="flex items-center justify-center gap-2 flex-1 bg-gray-900 text-white py-2 rounded-xl shadow-md hover:bg-black transition">
        <FaGithub className="text-lg" />
        <span className="font-medium">GitHub</span>
      </button>

    </div>
  );
}