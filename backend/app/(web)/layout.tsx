import { UserButtonClient } from '@/components/UserButtonClient';
import Link from 'next/link';
import { Receipt } from 'lucide-react';

export default function WebLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors">
            <Receipt className="w-5 h-5 text-primary" />
            Bill Me
          </Link>
          <UserButtonClient />
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
