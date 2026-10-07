import type { ReactNode } from "react";

// Die eigentlichen Root-Layouts liegen in app/[locale] und app/keystatic,
// weil beide ein eigenes <html> rendern.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
