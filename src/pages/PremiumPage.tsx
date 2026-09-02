import { useEffect, useState } from 'react';
import { Crown, Star, Calculator, MessageSquare, TrendingUp, Shield, Zap, Check, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { WatchlistItem, SavedCalculation } from '@/types';
import { formatPrice } from '@/lib/marketData';

interface PremiumPageProps {
  onOpenAuth: () => void;
}

export function PremiumPage({ onOpenAuth }: PremiumPageProps) {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [calcs, setCalcs] = useState<SavedCalculation[]>([]);
  const [tab, setTab] = useState<'features' | 'watchlist' | 'saved'>('features');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: wl }, { data: sc }] = await Promise.all([
        supabase.from('watchlist').select('*').order('added_at', { ascending: false }),
        supabase.from('saved_calculations').select('*').order('created_at', { ascending: false }),
      ]);
      setWatchlist((wl as WatchlistItem[]) ?? []);
      setCalcs((sc as SavedCalculation[]) ?? []);
    })();
  }, [user]);

  const removeFromWatchlist = async (id: string) => {
    await supabase.from('watchlist').delete().eq('id', id);
    setWatchlist((prev) => prev.filter((w) => w.id !== id));
  };

  const deleteCalc = async (id: string) => {
    await supabase.from('saved_calculations').delete().eq('id', id);
    setCalcs((prev) => prev.filter((c) => c.id !== id));
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
            <Crown className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold text-white">Unlock Premium Features</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            Sign in to access personal watchlists, saved calculations, chat history, and advanced analytics.
          </p>
          <button
            onClick={onOpenAuth}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-transform hover:scale-105"
          >
            <Crown className="h-4 w-4" /> Sign In to Unlock
          </button>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <feature.icon className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="mt-16 rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-2xl font-bold text-white">Free Plan</h3>
              <p className="mt-2 text-sm text-slate-400">Access to all market data and calculators</p>
              <ul className="mt-4 space-y-2">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                <h3 className="text-2xl font-bold text-white">Premium</h3>
              </div>
              <p className="mt-2 text-sm text-slate-400">Everything in Free, plus:</p>
              <ul className="mt-4 space-y-2">
                {PREMIUM_PERKS.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="h-4 w-4 text-amber-400" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onOpenAuth}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-semibold text-white"
              >
                Get Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged in premium dashboard
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
          <Crown className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Premium Dashboard</h1>
          <p className="text-slate-400">Your personal market toolkit</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {[
          { id: 'features' as const, label: 'Premium Features', icon: Zap },
          { id: 'watchlist' as const, label: 'My Watchlist', icon: Star },
          { id: 'saved' as const, label: 'Saved Calculations', icon: Calculator },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'features' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PREMIUM_FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
                <feature.icon className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-400">
                <Check className="h-3 w-3" /> Active
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'watchlist' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          {watchlist.length === 0 ? (
            <div className="p-12 text-center">
              <Star className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <p className="text-slate-400">Your watchlist is empty. Add stocks or crypto from the market pages.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-medium">Symbol</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Remove</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => (
                  <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-semibold text-white">{item.symbol}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${item.asset_type === 'crypto' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {item.asset_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => item.id && removeFromWatchlist(item.id)} className="text-slate-500 hover:text-red-400">
                        <Lock className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          {calcs.length === 0 ? (
            <div className="p-12 text-center">
              <Calculator className="mx-auto mb-3 h-8 w-8 text-slate-600" />
              <p className="text-slate-400">No saved calculations yet. Use the calculator and save your results.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Final Value</th>
                  <th className="px-4 py-3 font-medium">Total Invested</th>
                  <th className="px-4 py-3 font-medium">Growth</th>
                  <th className="px-4 py-3 font-medium text-right">Delete</th>
                </tr>
              </thead>
              <tbody>
                {calcs.map((calc) => (
                  <tr key={calc.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-white capitalize">{calc.calculation_type.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-sm text-emerald-400">
                      {formatPrice((calc.result_data as { finalValue?: number }).finalValue ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {formatPrice((calc.result_data as { totalContributed?: number }).totalContributed ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-amber-400">
                      {formatPrice((calc.result_data as { totalInterest?: number }).totalInterest ?? 0)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => calc.id && deleteCalc(calc.id)} className="text-slate-500 hover:text-red-400">
                        <Lock className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const PREMIUM_FEATURES = [
  { icon: Star, title: 'Personal Watchlist', description: 'Track your favorite stocks and crypto in one place. Get quick access to prices and trends.' },
  { icon: Calculator, title: 'Saved Calculations', description: 'Save your investment projections and DCA models for future reference.' },
  { icon: MessageSquare, title: 'Chat History', description: 'Your AI conversations are saved and accessible across sessions.' },
  { icon: TrendingUp, title: 'Advanced Analytics', description: 'Sector performance breakdowns and trend analysis tools.' },
  { icon: Shield, title: 'Priority Security', description: 'Bank-grade encryption with secure authentication.' },
  { icon: Zap, title: 'Real-time Alerts', description: 'Get notified when your watchlist assets make significant moves.' },
];

const FREE_FEATURES = [
  'Browse 500 stocks',
  'Browse 200 cryptocurrencies',
  'Investment calculator',
  'AI market assistant',
  'Market overview',
  'Top gainers & losers',
];

const PREMIUM_PERKS = [
  'Personal watchlist',
  'Saved calculations',
  'Chat history persistence',
  'Advanced sector analytics',
  'Priority support',
  'Ad-free experience',
];
