"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Field from "./Field";
import FormAlert from "./FormAlert";
import SubmitButton from "./SubmitButton";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") === "confirm" ? "That confirmation link is invalid or expired. Please log in or sign up again." : null,
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isSupabaseConfigured) return setError("Login isn't set up yet: Supabase keys are missing.");
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);

    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    });

    if (error) {
      setLoading(false);
      setError(
        error.message === "Email not confirmed"
          ? "Please confirm your email first. Check your inbox for the link."
          : "Incorrect email or password.",
      );
      return;
    }

    const next = params.get("next");
    router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormAlert message={error} />
      <Field label="Email" icon={Mail} name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
      <Field label="Password" icon={Lock} name="password" type="password" placeholder="••••••••" autoComplete="current-password" required minLength={6} />
      <SubmitButton loading={loading}>Log in</SubmitButton>
      <p className="text-center text-sm text-slate-500">
        New to NutriPath?{" "}
        <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}
