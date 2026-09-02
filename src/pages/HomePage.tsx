import { TrendingUp, TrendingDown, Activity, BarChart3, ArrowRight, Zap, Brain, Shield, Crown } from 'lucide-react';
import { getTopGainers, getTopLosers, getMostActive, formatPrice, formatVolume } from '@/lib/marketData';
import { Sparkline } from '@/components/charts/Sparkline';
import type { Page } from '@/types';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const gainers = getTopGainers(5);
  const losers = getTopLosers(5);
  const active = getMostActive(5);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950" />
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute top-20 right-10 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400">
              <Zap className="h-4 w-4" />
              Real-time market intelligence
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Master the markets with
              <span className="block bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                institutional-grade tools
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Track 500 top stocks and 200 leading cryptocurrencies. Calculate returns, get AI-powered
              market insights, and discover today's best opportunities — all in one professional platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('stocks')}
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
              >
                Explore Markets
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate('calculator')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-600 hover:bg-slate-800/50"
              >
                <BarChart3 className="h-4 w-4" />
                Investment Calculator
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Stocks Tracked', value: '500+', icon: TrendingUp },
              { label: 'Cryptocurrencies', value: '200+', icon: Activity },
              { label: 'AI Insights', value: '24/7', icon: Brain },
              { label: 'Secure Platform', value: 'Bank-Grade', icon: Shield },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <stat.icon className="mb-3 h-5 w-5 text-emerald-400" />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-white">Today's Market Overview</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Gainers */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white">Top Gainers</h3>
            </div>
            <div className="space-y-2">
              {gainers.map((asset) => (
                <div key={`${asset.type}-${asset.symbol}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs text-slate-500">{asset.name.slice(0, 20)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{formatPrice(asset.price)}</div>
                    <div className="text-xs font-semibold text-emerald-400">+{asset.changePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="font-semibold text-white">Top Losers</h3>
            </div>
            <div className="space-y-2">
              {losers.map((asset) => (
                <div key={`${asset.type}-${asset.symbol}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-slate-300">
                      {asset.symbol[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs text-slate-500">{asset.name.slice(0, 20)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{formatPrice(asset.price)}</div>
                    <div className="text-xs font-semibold text-red-400">{asset.changePercent}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Active */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="font-semibold text-white">Most Active</h3>
            </div>
            <div className="space-y-2">
              {active.map((asset) => (
                <div key={`${asset.type}-${asset.symbol}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-800/50">
                  <div className="flex items-center gap-2">
                    <Sparkline data={asset.history} width={40} height={20} color={asset.changePercent >= 0 ? '#34d399' : '#f87171'} />
                    <div>
                      <div className="text-sm font-medium text-white">{asset.symbol}</div>
                      <div className="text-xs text-slate-500">Vol: {formatVolume(asset.volume)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{formatPrice(asset.price)}</div>
                    <div className={`text-xs font-semibold ${asset.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={BarChart3}
            title="Investment Calculator"
            description="Project compound returns, model DCA strategies, and size positions with precision."
            onClick={() => onNavigate('calculator')}
          />
          <FeatureCard
            icon={Brain}
            title="AI Market Assistant"
            description="Get instant market reviews, today's best opportunities, and personalized insights."
            onClick={() => onNavigate('ai-chat')}
          />
          <FeatureCard
            icon={Crown}
            title="Premium Features"
            description="Unlock watchlists, saved calculations, chat history, and advanced analytics."
            onClick={() => onNavigate('premium')}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, onClick }: { icon: typeof TrendingUp; title: string; description: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-left transition-all hover:border-emerald-500/30 hover:bg-slate-900">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-emerald-500/20">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <h3 className="mb-2 font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-400">
        Learn more
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </div>
    </button>
  );
}


