export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  type: 'stock' | 'crypto';
  sector?: string;
  history: number[];
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  message: string;
  created_at?: string;
}

export interface WatchlistItem {
  id?: string;
  symbol: string;
  asset_type: 'stock' | 'crypto';
  name: string;
  added_at?: string;
}

export interface SavedCalculation {
  id?: string;
  calculation_type: string;
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown>;
  created_at?: string;
}

export type Page = 'home' | 'stocks' | 'crypto' | 'calculator' | 'ai-chat' | 'premium';
