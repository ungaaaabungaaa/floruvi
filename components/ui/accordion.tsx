"use client";
import { createContext, useContext, useId, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

// Native <details> keeps every answer in the page HTML for readers, search
// engines & AI assistants, and works before JavaScript loads.
const AccordionContext = createContext<{ name?: string; defaultValue?: string }>({});

export function Accordion({
  type = "single",
  defaultValue,
  className,
  children,
}: {
  type?: "single" | "multiple";
  defaultValue?: string;
  className?: string;
  children: ReactNode;
}) {
  const name = useId();
  return (
    <div className={className}>
      <AccordionContext.Provider
        value={{ name: type === "single" ? name : undefined, defaultValue }}
      >
        {children}
      </AccordionContext.Provider>
    </div>
  );
}
export function AccordionItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: ReactNode;
}) {
  const { name, defaultValue } = useContext(AccordionContext);
  return (
    <details
      name={name}
      open={value === defaultValue}
      className={`faq-item ${className ?? ""}`}
    >
      {children}
    </details>
  );
}
export function AccordionTrigger({ children }: { children: ReactNode }) {
  return (
    <summary className="faq-trigger">
      {children}
      <ChevronDown className="faq-chevron" size={18} aria-hidden="true" />
    </summary>
  );
}
export function AccordionContent({ children }: { children: ReactNode }) {
  return <div className="faq-content">{children}</div>;
}
