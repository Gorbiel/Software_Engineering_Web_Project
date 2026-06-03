import { SidebarNav } from "@/components/layout/sidenav/SidebarNav";
import { TopNav } from "@/components/layout/topnav/TopNav";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { MyProfileProvider } from "@/context/MyProfileContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <MyProfileProvider>
        <div className="flex h-dvh flex-col overflow-hidden">
          <TopNav />
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto flex w-full max-w-(--layout-max) flex-1 items-start gap-6 px-4 py-6 md:px-8">
              <aside className="sticky top-6 hidden max-h-[calc(100dvh-7rem)] flex-col gap-6 self-start overflow-y-auto md:flex md:w-(--layout-sidebar-left-md) lg:w-(--layout-sidebar-left)">
                <SidebarNav />
              </aside>
              <div className="flex min-w-0 flex-1 flex-col gap-6">
                <div className="md:hidden">
                  <SidebarNav variant="mobile" />
                </div>
                {children}
              </div>
            </div>
            {/* full-width, scrolls in at the end of the content */}
            <Footer />
          </main>
        </div>
      </MyProfileProvider>
    </AuthProvider>
  );
}
