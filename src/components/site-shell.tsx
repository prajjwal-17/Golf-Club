import Link from "next/link";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <header className="topbar">
        <Link href="/" className="brand">
          Golf Charity Club
        </Link>
        <nav>
          <Link href="/dashboard">Subscriber Dashboard</Link>
          <Link href="/admin">Admin Control</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

