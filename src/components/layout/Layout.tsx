import React, { ReactNode } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { Moon, Sun, Shield } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-100 transition-colors duration-200">
      <header className="border-b dark:border-gray-700 border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-500" />
            <h1 className="text-xl font-bold dark:text-white text-gray-900">HashCracker</h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-700" />
            )}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="border-t dark:border-gray-700 border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm dark:text-gray-400 text-gray-600">
          <p>For educational purposes only. Use responsibly and ethically.</p>
          <p className="mt-1">
            &copy; {new Date().getFullYear()} HashCracker Demo Tool
          </p>
        </div>
      </footer>
    </div>
  );
}