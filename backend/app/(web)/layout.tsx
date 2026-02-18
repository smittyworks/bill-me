import { UserButtonClient } from "@/components/UserButtonClient";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
          >
            <span className="text-primary">
              <Logo size={36} />
            </span>
            Bill Me
          </Link>
          <UserButtonClient />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
