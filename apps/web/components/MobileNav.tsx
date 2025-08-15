'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
}

export default function MobileNav({ lang, setLang }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: lang === 'en' ? 'My Account' : 'मेरा अकाउंट', icon: '👤' },
    { href: '/subscribers', label: lang === 'en' ? 'Statistics' : 'आँकड़े', icon: '📊' },
    { href: '/materials', label: lang === 'en' ? 'Materials' : 'सामग्री', icon: '📁' },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={toggleMenu}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg sm:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" onClick={toggleMenu} />
      )}

      {/* Mobile menu */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transform bg-white transition-transform duration-300 ease-in-out sm:hidden ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="safe-bottom rounded-t-3xl border-t border-gray-200 p-6">
          {/* Language toggle */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-full border border-gray-200 bg-gray-50 p-1">
              <button
                onClick={() => setLang('en')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  lang === 'en'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  lang === 'hi'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                हिं
              </button>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="space-y-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href === '/dashboard' && (pathname === '/' || pathname.startsWith('/dashboard')));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-violet-900 border border-violet-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <svg className="ml-auto h-5 w-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Quick actions */}
          <div className="mt-6 space-y-3">
            <button className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
              {lang === 'en' ? 'Quick Actions' : 'त्वरित कार्य'}
            </button>
            <div className="text-center text-xs text-gray-500">
              {lang === 'en' ? 'Instagram Affiliate v1.0' : 'Instagram Affiliate v1.0'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 