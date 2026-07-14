import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });

export const metadata: Metadata = {
  title: "Prasadh Pathiraja — Full Stack JavaScript Engineer",
  description:
    "Portfolio of Prasadh Pathiraja, a Full Stack JavaScript/TypeScript Engineer with 4+ years of experience building production applications.",
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
    <html lang="en" className={`h-full antialiased ${inter.variable} ${grotesk.variable}`}>
      <body className={`${inter.className} min-h-full`}>{children}</body>
    </html>
  );
}
