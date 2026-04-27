import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Finance by Ujjwal — Making Finance Simple",
  description: "Clear, accurate, and original finance writing — for people who want to understand their money without a finance degree.",
  openGraph: {
    title: "Finance by Ujjwal",
    description: "Making finance simple, one article at a time.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
