/** Slim app footer rendered at the bottom of the shell content column. */
export default function Footer() {
  return (
    <footer className="border-t border-line px-4 py-4 lg:px-6">
      <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 text-[12px] text-ink-3">
        <span className="flex items-center gap-2">
          <img src="/logo.svg" alt="" className="h-4 w-4 opacity-70" />
          MyTT — Telecom Portal · Admin Back-office
        </span>
        <span className="font-mono text-[11px]">v1.0.0 · Admin Back-office</span>
      </div>
    </footer>
  );
}
