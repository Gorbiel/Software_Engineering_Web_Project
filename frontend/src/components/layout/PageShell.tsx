type PageShellProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
};

export function PageShell({ children, sidebar }: PageShellProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-6">{children}</div>
        <aside className="flex w-full flex-col gap-6 xl:sticky xl:top-6 xl:max-h-[calc(100dvh-7rem)] xl:w-(--layout-sidebar-right) xl:self-start xl:overflow-y-auto">
          {sidebar}
        </aside>
      </div>
    </section>
  );
}
