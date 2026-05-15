import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  threshold?: number;
}

export const SectionReveal = ({ children, delay = 0, threshold = 0.12 }: SectionRevealProps) => {
  const ref = useScrollReveal<HTMLDivElement>({ threshold });
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};
