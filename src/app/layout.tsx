import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Golf Charity Club | Golf Charity Subscription Platform",
  description:
    "A modern golf subscription platform combining draw-based rewards, score tracking, and charitable giving.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

