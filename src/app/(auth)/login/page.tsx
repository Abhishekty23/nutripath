import { Suspense } from "react";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import DemoLogin from "@/components/auth/DemoLogin";

export const metadata: Metadata = { title: "Log in | NutriPath" };

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to see your bookings and diet plan.">
      <Suspense>
        <LoginForm />
      </Suspense>
      <DemoLogin />
    </AuthShell>
  );
}
