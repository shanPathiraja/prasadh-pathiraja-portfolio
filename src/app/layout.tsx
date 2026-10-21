import type { Metadata } from "next";
import { Syne, Manrope, DM_Mono } from "next/font/google";
import "./globals.css";

/* Display / body / mono — exposed as CSS variables that globals.css consumes. */
const syne = Syne({ subsets: ["latin"], variable: "--font-display" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Prasadh Pathiraja — Full Stack Engineer",
  description:
    "Portfolio of Prasadh Pathiraja, a Full Stack JavaScript/TypeScript Engineer with 4+ years of experience building production applications end-to-end.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${manrope.variable} ${dmMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
