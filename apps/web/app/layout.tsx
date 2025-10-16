import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@jn76w8fswz9hy73pg5zjc6g9zx7sj1m6/components";

export const metadata: Metadata = {
  title: "Simple Todo - Organize your tasks",
  description: "An ultrasimple, production-ready todo list application with real-time updates",
};

export default function RootLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
