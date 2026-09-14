"use client";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export const Accordion = AccordionPrimitive.Root;
export function AccordionItem(
  props: React.ComponentProps<typeof AccordionPrimitive.Item>,
) {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={`faq-item ${props.className ?? ""}`}
    />
  );
}
export function AccordionTrigger({
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger {...props} className="faq-trigger">
        {children}
        <ChevronDown className="faq-chevron" size={18} aria-hidden="true" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
export function AccordionContent(
  props: React.ComponentProps<typeof AccordionPrimitive.Content>,
) {
  return <AccordionPrimitive.Content {...props} className="faq-content" />;
}
