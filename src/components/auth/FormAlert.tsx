"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function FormAlert({ message, type = "error" }: { message: string | null; type?: "error" | "success" }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className="overflow-hidden"
        >
          <div
            role="alert"
            className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${
              type === "error" ? "bg-red-50 text-red-700 ring-1 ring-red-100" : "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
            }`}
          >
            {type === "error" ? <AlertCircle size={18} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0" />}
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
