import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/AudioProvider";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "A Simpler Xmas",
  description: "25 days of small, kind moments for a calmer Christmas. Design your personalised advent plan (Dec 1-25) for a more mindful holiday season.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${dmSans.variable} antialiased bg-cream min-h-screen`}
      >
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
