"use client";
import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus, Minus } from "lucide-react";

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
        <span className="faq-toggle" aria-hidden="true">
          <Plus className="faq-plus" size={18} />
          <Minus className="faq-minus" size={18} />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
export function AccordionContent(
  props: React.ComponentProps<typeof AccordionPrimitive.Content>,
) {
  return <AccordionPrimitive.Content {...props} className="faq-content" />;
}
