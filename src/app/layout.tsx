import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GlobalSMM | Enterprise Social Media Infrastructure",
  description:
    "Enterprise-grade social media growth, high-speed API delivery, and precision metrics across 150+ countries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} h-full antialiased`}>
      <body className="custom-scroll min-h-full flex flex-col bg-background text-on-background font-sans selection:bg-secondary/30">
        {children}
      </body>
    </html>
  );
}
