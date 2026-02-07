import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import Link from 'next/link';
import { UserGroupIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ClientHub - Sistema de Gestión de Clientes',
  description: 'Gestión profesional de clientes y documentos de identificación',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <div className="flex flex-col min-h-screen bg-[var(--background)] transition-theme">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-[var(--card)]/80 backdrop-blur-lg supports-[backdrop-filter]:bg-[var(--card)]/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                  {/* Logo */}
                  <Link href="/clients" className="flex items-center gap-2 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
                      <UserGroupIcon className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      ClientHub
                    </span>
                  </Link>

                  {/* Navigation */}
                  <nav className="hidden md:flex items-center gap-1">
                    <Link
                      href="/clients"
                      className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] rounded-lg transition-all"
                    >
                      Clientes
                    </Link>
                  </nav>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Link
                      href="/clients/new"
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                      <PlusCircleIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Nuevo Cliente</span>
                      <span className="sm:hidden">Nuevo</span>
                    </Link>
                    <div className="h-6 w-px bg-[var(--border)]" />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t bg-[var(--card)]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-sm text-[var(--muted-foreground)]">
                  © 2026 ClientHub. Sistema de Gestión de Clientes.
                </p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
