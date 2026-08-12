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

// Runs before first paint so the page never flashes the wrong theme.
// Keep the storage key/default in sync with src/lib/theme.ts.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("gsmm-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark");}catch(e){document.documentElement.setAttribute("data-theme","dark");}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="custom-scroll min-h-full flex flex-col bg-background text-on-background font-sans selection:bg-secondary/30">
        {children}
      </body>
    </html>
  );
}
