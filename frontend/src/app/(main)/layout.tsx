import { SidebarNav } from "@/components/SidebarNav";
import { TopNav } from "@/components/TopNav";
import { AuthProvider } from "@/context/AuthContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col">
        <TopNav />
        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-(--layout-max) gap-6 px-4 py-6 md:px-8">
            <aside className="hidden w-(--layout-sidebar-left) flex-col gap-6 md:flex">
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
    </AuthProvider>
  );
}
