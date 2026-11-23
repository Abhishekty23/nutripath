import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create account | NutriPath" };

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Start your personalised nutrition journey.">
      <SignupForm />
    </AuthShell>
  );
}
