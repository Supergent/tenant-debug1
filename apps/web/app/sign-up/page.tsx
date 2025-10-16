/**
 * Sign Up Page
 *
 * Allows users to create a new account with email and password.
 * Redirects to home page after successful sign-up.
 */

import dynamic from "next/dynamic";

const SignUpForm = dynamic(
  () => import("@/components/sign-up-form").then((mod) => mod.SignUpForm),
  { ssr: false }
);

export const metadata = {
  title: "Sign Up - Simple Todo",
  description: "Create your todo list account",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignUpForm />
    </div>
  );
}
