import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { keystaticEnabled } from "@/keystatic/enabled";
import KeystaticApp from "./keystatic";

export const metadata = { robots: { index: false, follow: false } };

export default function KeystaticLayout({ children }: { children: ReactNode }) {
  if (!keystaticEnabled) notFound();
  return (
    <html lang="de">
      <body>
        <KeystaticApp />
        {children}
      </body>
    </html>
  );
}
