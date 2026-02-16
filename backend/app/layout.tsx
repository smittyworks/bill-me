import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bill Me API',
  description: 'Backend API for Bill Me mobile app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
