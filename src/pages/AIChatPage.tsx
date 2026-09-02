import { useState, useRef, useEffect } from 'react';
import { Brain, Send, Sparkles, TrendingUp, TrendingDown, Bot, User as UserIcon, Trash2 } from 'lucide-react';
import { getTopGainers, getTopLosers, getMostActive, getAllAssets, formatPrice } from '@/lib/marketData';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types';

const SUGGESTED_PROMPTS = [
  'Give me today\'s market review',
  'What are the best offers today?',
  'What are today\'s biggest losses?',
  'Which sectors are performing best?',
  'Give me a crypto market summary',
];

function generateResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  const gainers = getTopGainers(5);
  const losers = getTopLosers(5);
  const active = getMostActive(5);
  const all = getAllAssets();
  const stockCount = all.filter((a) => a.type === 'stock').length;
  const cryptoCount = all.filter((a) => a.type === 'crypto').length;
  const avgChange = all.reduce((s, a) => s + a.changePercent, 0) / all.length;
  const upCount = all.filter((a) => a.changePercent > 0).length;
  const downCount = all.filter((a) => a.changePercent < 0).length;

  if (lower.includes('review') || lower.includes('summary') || lower.includes('overview')) {
    return `Here's today's market review:\n\n**Market Sentiment:** ${avgChange >= 0 ? 'Bullish' : 'Bearish'} — average change across all tracked assets is ${avgChange.toFixed(2)}%.\n\n**Breadth:** ${upCount} assets advancing vs ${downCount} declining out of ${stockCount + cryptoCount} tracked.\n\n**Top Gainers:**\n${gainers.map((g, i) => `${i + 1}. ${g.symbol} (${g.name}) — ${formatPrice(g.price)} (+${g.changePercent}%)`).join('\n')}\n\n**Top Losers:**\n${losers.map((l, i) => `${i + 1}. ${l.symbol} (${l.name}) — ${formatPrice(l.price)} (${l.changePercent}%)`).join('\n')}\n\n**Most Active:**\n${active.map((a, i) => `${i + 1}. ${a.symbol} — ${formatPrice(a.price)} (${a.changePercent >= 0 ? '+' : ''}${a.changePercent}%)`).join('\n')}\n\nThe overall market is showing ${avgChange >= 0 ? 'strength' : 'weakness'} with ${upCount > downCount ? 'more advancers than decliners' : 'more decliners than advancers'}.`;
  }

  if (lower.includes('offer') || lower.includes('opportunity') || lower.includes('best')) {
    return `Today's Best Opportunities:\n\n**Top 5 Gainers — Potential Momentum Plays:**\n${gainers.map((g, i) => `${i + 1}. ${g.symbol} (${g.name}) — Current: ${formatPrice(g.price)}, Change: +${g.changePercent}%\n   30-day trend shows ${g.history[g.history.length - 1] > g.history[0] ? 'uptrend' : 'recovery from lows'}.`).join('\n\n')}\n\n**Most Active — High Liquidity Opportunities:**\n${active.slice(0, 3).map((a, i) => `${i + 1}. ${a.symbol} — ${formatPrice(a.price)} (${a.changePercent >= 0 ? '+' : ''}${a.changePercent}%)`).join('\n')}\n\n**Analysis:** The top gainers today show strong momentum. Consider waiting for pullbacks before entering. High-volume assets offer better liquidity for entries and exits.\n\n*Disclaimer: This is not financial advice. Always do your own research.*`;
  }

  if (lower.includes('loss') || lower.includes('loser') || lower.includes('decline') || lower.includes('drop')) {
    return `Today's Biggest Losses:\n\n${losers.map((l, i) => `${i + 1}. ${l.symbol} (${l.name})\n   Price: ${formatPrice(l.price)}\n   Change: ${l.changePercent}%\n   30-day trend: ${l.history[l.history.length - 1] > l.history[0] ? 'Still in uptrend despite today' : 'In downtrend'}`).join('\n\n')}\n\n**Risk Assessment:** ${losers.filter((l) => l.history[l.history.length - 1] < l.history[0]).length} out of 5 top losers are also down over the past 30 days, suggesting sustained selling pressure rather than temporary dips.\n\n**Strategy Note:** Some of these may present buying opportunities if fundamentals remain strong. Look for oversold conditions and wait for reversal confirmation.\n\n*Disclaimer: This is not financial advice.*`;
  }

  if (lower.includes('sector') || lower.includes('industry')) {
    const stocks = all.filter((a) => a.type === 'stock');
    const sectorMap: Record<string, { total: number; count: number; up: number }> = {};
    stocks.forEach((s) => {
      const sec = s.sector || 'Unknown';
      if (!sectorMap[sec]) sectorMap[sec] = { total: 0, count: 0, up: 0 };
      sectorMap[sec].total += s.changePercent;
      sectorMap[sec].count++;
      if (s.changePercent > 0) sectorMap[sec].up++;
    });
    const sorted = Object.entries(sectorMap).map(([name, data]) => ({
      name,
      avg: data.total / data.count,
      count: data.count,
      upPct: (data.up / data.count) * 100,
    })).sort((a, b) => b.avg - a.avg);

    return `Sector Performance Analysis:\n\n${sorted.map((s, i) => `${i + 1}. ${s.name}: ${s.avg >= 0 ? '+' : ''}${s.avg.toFixed(2)}% avg (${s.upPct.toFixed(0)}% of stocks up, ${s.count} stocks)`).join('\n')}\n\n**Best performing sector:** ${sorted[0].name} with an average of ${sorted[0].avg >= 0 ? '+' : ''}${sorted[0].avg.toFixed(2)}%.\n\n**Worst performing sector:** ${sorted[sorted.length - 1].name} with an average of ${sorted[sorted.length - 1].avg.toFixed(2)}%.`;
  }

  if (lower.includes('crypto')) {
    const cryptos = all.filter((a) => a.type === 'crypto');
    const cryptoGainers = [...cryptos].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
    const cryptoLosers = [...cryptos].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
    const cryptoAvg = cryptos.reduce((s, a) => s + a.changePercent, 0) / cryptos.length;

    return `Crypto Market Summary:\n\n**Overall:** ${cryptoCount} cryptocurrencies tracked. Average change: ${cryptoAvg >= 0 ? '+' : ''}${cryptoAvg.toFixed(2)}%.\n\n**Top Crypto Gainers:**\n${cryptoGainers.map((c, i) => `${i + 1}. ${c.symbol} (${c.name}) — ${formatPrice(c.price)} (+${c.changePercent}%)`).join('\n')}\n\n**Top Crypto Losers:**\n${cryptoLosers.map((c, i) => `${i + 1}. ${c.symbol} (${c.name}) — ${formatPrice(c.price)} (${c.changePercent}%)`).join('\n')}\n\nThe crypto market is ${cryptoAvg >= 0 ? 'in the green' : 'in the red'} today with ${cryptoGainers[0].symbol} leading gains at +${cryptoGainers[0].changePercent}%.`;
  }

  return `I can help you with:\n\n• **Market Review** — Today's overall market summary\n• **Best Offers** — Top opportunities and momentum plays\n• **Biggest Losses** — Today's top losers and risk analysis\n• **Sector Analysis** — Which sectors are performing best\n• **Crypto Summary** — Cryptocurrency market overview\n\nTry asking me any of these, or ask about specific stocks or cryptocurrencies!`;
}

export function AIChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      message: "Hi! I'm your AI Market Assistant. I can provide real-time market reviews, today's best opportunities, biggest losses, sector analysis, and crypto summaries. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase
          .from('chat_history')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        if (data && data.length > 0) {
          setMessages([
            {
              role: 'assistant',
              message: "Welcome back! I've loaded your previous conversation. How can I help you today?",
            },
            ...data.reverse().map((d: { role: string; message: string }) => ({ role: d.role as 'user' | 'assistant', message: d.message })),
          ]);
        }
      })();
    }
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const content = text ?? input;
    if (!content.trim() || loading) return;
    setInput('');
    setLoading(true);
    const userMsg: ChatMessage = { role: 'user', message: content };
    setMessages((prev) => [...prev, userMsg]);

    if (user) {
      await supabase.from('chat_history').insert({ role: 'user', message: content });
    }

    setTimeout(async () => {
      const response = generateResponse(content);
      setMessages((prev) => [...prev, { role: 'assistant', message: response }]);
      setLoading(false);
      if (user) {
        await supabase.from('chat_history').insert({ role: 'assistant', message: response });
      }
    }, 600);
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from('chat_history').delete().eq('user_id', user.id);
    setMessages([{ role: 'assistant', message: "Conversation cleared. How can I help you?" }]);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
            <Brain className="h-7 w-7 text-emerald-400" />
            AI Market Assistant
          </h1>
          <p className="mt-1 text-slate-400">Get instant market reviews, best offers, and insights</p>
        </div>
        {user && messages.length > 1 && (
          <button onClick={clearHistory} className="flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            <Trash2 className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {/* Chat container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div ref={scrollRef} className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-100'
              }`}>
                <p className="text-sm whitespace-pre-line">{msg.message}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-700">
                  <UserIcon className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-xl bg-slate-800 px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div className="border-t border-slate-800 p-4">
            <div className="mb-2 flex items-center gap-1 text-xs text-slate-500">
              <Sparkles className="h-3 w-3" /> Suggested questions
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => send(prompt)}
                  className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-emerald-500/30 hover:bg-slate-800"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-800 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about market trends, best offers, losses..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {!user && (
        <p className="mt-4 text-center text-sm text-slate-500">
          Sign in to save your chat history across sessions
        </p>
      )}
    </div>
  );
}
