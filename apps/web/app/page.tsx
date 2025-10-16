/**
 * Home Page - Todo App
 *
 * Main application page displaying the todo list.
 * Protected by AuthGuard - requires authentication.
 */

import dynamic from "next/dynamic";

// Dynamic imports for client components
const AuthGuard = dynamic(
  () => import("@/components/auth-guard").then((mod) => mod.AuthGuard),
  { ssr: false }
);

const TodoApp = dynamic(
  () => import("@/components/todo-app").then((mod) => mod.TodoApp),
  { ssr: false }
);

export default function Page() {
  return (
    <AuthGuard>
      <TodoApp />
    </AuthGuard>
  );
}
