"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Lock, Mail, MailCheck, Phone, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Field from "./Field";
import FormAlert from "./FormAlert";
import SubmitButton from "./SubmitButton";

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabaseConfigured) return setError("Sign up isn't set up yet: Supabase keys are missing.");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    setError(null);

    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { full_name: String(form.get("full_name")).trim(), phone: String(form.get("phone")).trim() },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
      },
    });

    setLoading(false);
    if (error) return setError(error.message);

    // If email confirmation is off, the user is logged in straight away
    if (data.session) {
      router.replace("/dashboard");
      router.refresh();
    } else {
      setSentTo(email);
    }
  }

  if (sentTo) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl bg-emerald-50 p-8 text-center ring-1 ring-emerald-100">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
          className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-white"
        >
          <MailCheck size={28} />
        </motion.span>
        <h2 className="mt-5 text-xl font-bold text-slate-900">Check your email</h2>
        <p className="mt-2 text-slate-600">
          We sent a confirmation link to <span className="font-semibold text-slate-900">{sentTo}</span>. Click it to activate your account.
        </p>
        <Link href="/login" className="mt-6 inline-block font-semibold text-emerald-700 hover:text-emerald-800">
          Back to login
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormAlert message={error} />
      <Field label="Full name" icon={User} name="full_name" placeholder="Priya Sharma" autoComplete="name" required />
      <Field label="Email" icon={Mail} name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
      <Field label="Phone (optional)" icon={Phone} name="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" />
      <Field label="Password" icon={Lock} name="password" type="password" placeholder="At least 8 characters" autoComplete="new-password" required minLength={8} />
      <SubmitButton loading={loading}>Create account</SubmitButton>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
