import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import { SidebarNav } from "@/components/SidebarNav";
import { TopNav } from "@/components/TopNav";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="pl" className={`${nunito.variable} h-full antialiased`}>
      <body className="bg-background text-text min-h-full">
        <div className="flex min-h-screen flex-col">
          <TopNav />
          <main className="flex-1">
            <div className="mx-auto flex w-full max-w-(--layout-max) gap-6 px-4 py-6 md:px-8">
              <aside className="hidden w-(--layout-sidebar-left) flex-col gap-6 md:flex">
                <div className="glaze-card flex flex-col items-center gap-3 text-center">
                  {/* placeholdery */}
                  <div className="bg-background h-20 w-20 rounded-3xl" />
                  <div className="flex flex-col gap-1">
                    <p className="text-text text-base font-semibold">
                      User Name
                    </p>
                    <p className="text-text-muted text-xs font-semibold">
                      Rank: ---
                    </p>
                  </div>
                  <div className="w-full">
                    <div className="bg-accent-softer h-2 w-full rounded-full">
                      <div className="bg-accent h-full w-2/3 rounded-full" />
                    </div>
                    <p className="text-accent mt-2 text-xs font-semibold">
                      Progress to next rank
                    </p>
                  </div>
                </div>
                <SidebarNav />
              </aside>
              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <div className="md:hidden">
                  <SidebarNav variant="mobile" />
                </div>
                {children}
              </div>
            </div>
          </main>
          <footer className="border-border bg-surface border-t">
            <div className="text-text-muted mx-auto flex w-full max-w-(--layout-max) flex-col items-start justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:items-center md:px-8">
              <span className="text-primary text-[20px] font-bold tracking-[-0.02em]">
                &copy; 2026 GlazedIn
              </span>
              <div className="flex flex-wrap gap-4">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Guidelines</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
