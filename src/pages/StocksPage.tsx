import { useState, useMemo } from 'react';
import { Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { getStocks, formatPrice, formatVolume, formatCurrency } from '@/lib/marketData';
import { Sparkline } from '@/components/charts/Sparkline';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Asset } from '@/types';

type SortField = 'symbol' | 'price' | 'changePercent' | 'volume' | 'marketCap';
type SortDir = 'asc' | 'desc';

export function StocksPage() {
  const { user } = useAuth();
  const allStocks = useMemo(() => getStocks(), []);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(0);
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());
  const pageSize = 50;

  const sectors = useMemo(() => {
    const s = new Set(allStocks.map((st) => st.sector).filter(Boolean) as string[]);
    return ['All', ...Array.from(s).sort()];
  }, [allStocks]);

  const filtered = useMemo(() => {
    let result = allStocks;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    if (sector !== 'All') {
      result = result.filter((s) => s.sector === sector);
    }
    result = [...result].sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = typeof av === 'string' ? String(av).localeCompare(String(bv)) : (av as number) - (bv as number);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [allStocks, search, sector, sortField, sortDir]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const toggleWatch = async (asset: Asset) => {
    if (!user) return;
    const key = `${asset.symbol}`;
    if (watchlist.has(key)) {
      setWatchlist((prev) => { const n = new Set(prev); n.delete(key); return n; });
      await supabase.from('watchlist').delete().eq('symbol', asset.symbol).eq('asset_type', 'stock');
    } else {
      setWatchlist((prev) => new Set(prev).add(key));
      await supabase.from('watchlist').insert({ symbol: asset.symbol, asset_type: 'stock', name: asset.name });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Stocks</h1>
        <p className="mt-1 text-slate-400">Browse {allStocks.length} top stocks with real-time price data and 30-day trends</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={sector}
          onChange={(e) => { setSector(e.target.value); setPage(0); }}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium">
                <button onClick={() => handleSort('symbol')} className="flex items-center gap-1 hover:text-slate-300">
                  Symbol {sortField === 'symbol' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium text-right">
                <button onClick={() => handleSort('price')} className="hover:text-slate-300">
                  Price {sortField === 'price' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="px-4 py-3 font-medium text-right">
                <button onClick={() => handleSort('changePercent')} className="hover:text-slate-300">
                  Change {sortField === 'changePercent' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="hidden px-4 py-3 font-medium text-right md:table-cell">
                <button onClick={() => handleSort('volume')} className="hover:text-slate-300">
                  Volume {sortField === 'volume' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="hidden px-4 py-3 font-medium text-right lg:table-cell">
                <button onClick={() => handleSort('marketCap')} className="hover:text-slate-300">
                  Market Cap {sortField === 'marketCap' && (sortDir === 'asc' ? '↑' : '↓')}
                </button>
              </th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Trend</th>
              {user && <th className="px-4 py-3 font-medium text-center">Watch</th>}
            </tr>
          </thead>
          <tbody>
            {paged.map((stock) => (
              <tr key={stock.symbol} className="border-b border-slate-800/50 transition-colors hover:bg-slate-800/30">
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{stock.symbol}</div>
                  <div className="text-xs text-slate-500">{stock.sector}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 max-w-[200px] truncate">{stock.name}</td>
                <td className="px-4 py-3 text-right font-medium text-white">{formatPrice(stock.price)}</td>
                <td className="px-4 py-3 text-right">
                  <div className={`inline-flex items-center gap-1 text-sm font-medium ${stock.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {stock.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-right text-sm text-slate-400 md:table-cell">{formatVolume(stock.volume)}</td>
                <td className="hidden px-4 py-3 text-right text-sm text-slate-400 lg:table-cell">{formatCurrency(stock.marketCap)}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Sparkline data={stock.history} width={80} height={24} color={stock.changePercent >= 0 ? '#34d399' : '#f87171'} />
                </td>
                {user && (
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleWatch(stock)} className="text-slate-500 hover:text-amber-400">
                      <Star className={`h-4 w-4 ${watchlist.has(stock.symbol) ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30 hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-sm text-slate-400">
            Page {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 disabled:opacity-30 hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
