"use client";

import { useToast } from "@jn76w8fswz9hy73pg5zjc6g9zx7sj1m6/components";

export function useDemoToast() {
  const { toast } = useToast();
  return toast;
}
