export function Footer() {
  return (
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
  );
}
