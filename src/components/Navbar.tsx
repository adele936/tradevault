import { useState } from 'react';
import { TrendingUp, Menu, X, Crown, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { Page } from '@/types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onOpenAuth: () => void;
}

const NAV_ITEMS: Array<{ id: Page; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'stocks', label: 'Stocks' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'calculator', label: 'Calculator' },
  { id: 'ai-chat', label: 'AI Assistant' },
  { id: 'premium', label: 'Premium' },
];

export function Navbar({ currentPage, onNavigate, onOpenAuth }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button onClick={() => handleNav('home')} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Trade<span className="text-emerald-400">Vault</span>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === item.id
                  ? 'text-emerald-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
              {item.id === 'premium' && <Crown className="ml-1 inline h-3.5 w-3.5" />}
              {currentPage === item.id && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-emerald-400" />
              )}
            </button>
          ))}
        </div>

        <div className="hidden md:block">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-slate-600"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-xs font-bold text-white">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.email}</span>
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl z-20">
                    <div className="px-4 py-2 text-xs text-slate-500">
                      Signed in as<br />
                      <span className="text-slate-300">{user.email}</span>
                    </div>
                    <button
                      onClick={() => { signOut(); setUserMenu(false); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
            >
              Sign In
            </button>
          )}
        </div>

        <button className="md:hidden text-slate-300" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 py-4 md:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`block w-full px-3 py-2 text-left text-sm font-medium ${
                currentPage === item.id ? 'text-emerald-400' : 'text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="mt-3 border-t border-slate-800 pt-3">
            {user ? (
              <button
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            ) : (
              <button
                onClick={() => { onOpenAuth(); setMobileOpen(false); }}
                className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
