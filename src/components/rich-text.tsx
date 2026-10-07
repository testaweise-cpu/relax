import Markdoc, { type Node } from "@markdoc/markdoc";
import React from "react";
import { cn } from "@/lib/cn";

/** Gibt Markdoc-Inhalte aus Keystatic (Rechtstexte) als React aus. */
export function RichText({
  node,
  className,
}: {
  node: Node;
  className?: string;
}) {
  const content = Markdoc.transform(node);
  return (
    <div className={cn("rich-text", className)}>
      {Markdoc.renderers.react(content, React)}
    </div>
  );
}

/** Mehrzeiliger Text aus Keystatic: Leerzeile = neuer Absatz. */
export function Paragraphs({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}
