import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { HomePage } from '@/pages/HomePage';
import { StocksPage } from '@/pages/StocksPage';
import { CryptoPage } from '@/pages/CryptoPage';
import { CalculatorPage } from '@/pages/CalculatorPage';
import { AIChatPage } from '@/pages/AIChatPage';
import { PremiumPage } from '@/pages/PremiumPage';
import type { Page } from '@/types';

function AppContent() {
  const [page, setPage] = useState<Page>('home');
  const [authOpen, setAuthOpen] = useState(false);

  const navigate = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar currentPage={page} onNavigate={navigate} onOpenAuth={() => setAuthOpen(true)} />

      <main>
        {page === 'home' && <HomePage onNavigate={navigate} />}
        {page === 'stocks' && <StocksPage />}
        {page === 'crypto' && <CryptoPage />}
        {page === 'calculator' && <CalculatorPage />}
        {page === 'ai-chat' && <AIChatPage />}
        {page === 'premium' && <PremiumPage onOpenAuth={() => setAuthOpen(true)} />}
      </main>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              TradeVault — Professional market intelligence platform
            </p>
            <p className="text-xs text-slate-600">
              Data is simulated for demonstration. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Analytics />
    </AuthProvider>
  );
}

export default App;
