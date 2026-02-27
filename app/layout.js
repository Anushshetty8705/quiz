"use client";

import "./globals.css";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-r from-indigo-600 to-purple-700 text-white">

        {/* ✅ Keep Toaster outside */}
        <Toaster position="top-center" />

        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}   // 🔥 IMPORTANT
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>

      </body>
    </html>
  );
}