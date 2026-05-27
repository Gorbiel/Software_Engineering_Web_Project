import { SidebarNav } from "@/components/layout/sidenav/SidebarNav";
import { TopNav } from "@/components/layout/topnav/TopNav";
import { Footer } from "@/components/layout/Footer";
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
            <aside className="hidden flex-col gap-6 md:flex md:w-(--layout-sidebar-left-md) lg:w-(--layout-sidebar-left)">
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
        <Footer />
      </div>
    </AuthProvider>
  );
}
