import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlazedIn",
  description: "Employee recognition hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="bg-background text-text min-h-full">{children}</body>
    </html>
  );
}
