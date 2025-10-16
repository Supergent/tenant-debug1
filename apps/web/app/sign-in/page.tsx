/**
 * Sign In Page
 *
 * Allows users to sign in with email and password.
 * Redirects to home page after successful sign-in.
 */

import dynamic from "next/dynamic";

const SignInForm = dynamic(
  () => import("@/components/sign-in-form").then((mod) => mod.SignInForm),
  { ssr: false }
);

export const metadata = {
  title: "Sign In - Simple Todo",
  description: "Sign in to your todo list account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <SignInForm />
    </div>
  );
}
