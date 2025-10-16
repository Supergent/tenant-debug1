/**
 * Auth Guard Component
 *
 * Protects routes by checking authentication status.
 * Redirects to sign-in page if not authenticated.
 * Shows loading state while checking auth.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@jn76w8fswz9hy73pg5zjc6g9zx7sj1m6/components";
import { useSession } from "better-auth/react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  // Loading state
  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Not authenticated - will redirect
  if (!session) {
    return null;
  }

  // Authenticated - show children
  return <>{children}</>;
}
