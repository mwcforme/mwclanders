import { useCallback } from "react";

export function useScrollToForm(): () => void {
  return useCallback(() => {
    const el = document.getElementById("final-cta") ?? document.getElementById("hero-form");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
}
