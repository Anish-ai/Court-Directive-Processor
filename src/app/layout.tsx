import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { AppProvider } from './providers';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CDP | Court Directive Processor',
  description: 'AI-Assisted Judicial Decision Support System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-[#0a0a0a] min-h-screen flex flex-col text-slate-800 dark:text-slate-200 antialiased selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-cyan-50 transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-4 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-cyan-500 dark:to-blue-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-lg group-hover:scale-105 transition-all duration-300">
                  ⚖️
                </div>
                <div className="flex flex-col justify-center">
                   <span className="font-bold tracking-wider text-xl bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 leading-none mb-1">CDP</span>
                   <span className="text-[10px] uppercase font-black tracking-[0.15em] text-blue-600 dark:text-cyan-500 leading-none">Court Directive Processor</span>
                </div>
                <div className="hidden md:flex ml-4 items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full shadow-inner transition-colors">
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">AI-Assisted Judicial Decision Support System</span>
                </div>
              </Link>
              <nav className="flex items-center gap-8">
                <Link href="/" className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors relative after:absolute after:-bottom-4 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-blue-600 dark:after:bg-cyan-500 after:transition-all">Dashboard</Link>
                <Link href="/upload" className="text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors relative after:absolute after:-bottom-4 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-blue-600 dark:after:bg-cyan-500 after:transition-all">Ingest Document</Link>
                <div className="w-px h-6 bg-slate-300 dark:bg-white/10"></div>
                <ThemeToggle />
              </nav>
            </div>
          </header>
          <main className="flex-1 flex flex-col relative overflow-hidden">
             {/* Dynamic background glows */}
             <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] pointer-events-none transition-all duration-700" />
             <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 dark:bg-cyan-600/10 blur-[120px] pointer-events-none transition-all duration-700" />
             <div className="relative z-10 flex-1 flex flex-col min-h-0 h-full">
                <AppProvider>
                  {children}
                </AppProvider>
             </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
