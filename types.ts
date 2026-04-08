export enum TradeDirection {
  LONG = "LONG",
  SHORT = "SHORT",
  NEUTRAL = "NEUTRAL",
}

export enum TradeResult {
  WIN = "WIN",
  LOSS = "LOSS",
  PENDING = "PENDING",
}

export interface AdvancedAnalysis {
  marketStructure: {
    trend: string;
    structureType: string;
    breakOfStructure: string;
    changeOfCharacter: string;
  };
  keyLevels: {
    supplyZones: string[];
    demandZones: string[];
    fairValueGaps: string[];
    orderBlocks: string[];
  };
  patterns: {
    candlePatterns: string[];
    chartPatterns: string[];
  };
  volumeMomentum: string;
  indicators: string;
  liquidityMap: {
    sweepLevels: string;
    magnetZones: string;
  };
  strategy: {
    suggestedType: string;
    warning: string;
  };
}

export interface TradeSetup {
  isChart?: boolean;
  asset: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  takeProfit2?: string;
  takeProfit3?: string;
  support?: string;
  resistance?: string;
  riskRewardRatio: string;
  reasoning: string;
  confidence: number;
  marketPriceAtAnalysis?: number;
  advanced?: AdvancedAnalysis;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: "SCREENSHOT" | "TWEET";
  setup: TradeSetup;
  sourceImage?: string;
  sourceText?: string;
  result: TradeResult;
  pnlPercentage?: number;
}

export interface TrackedAccount {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string;
  lastScannedTweetId?: string;
  lastScannedTime?: number;
  addedAt?: number;
  platform?: "twitter" | "instagram" | "youtube";
  isVerified?: boolean;
  isCustom?: boolean; 
}

export enum SubscriptionTier {
  FREE = "FREE",
  PLUS = "PLUS",
  PRO = "PRO",
}

export interface PendingSignal {
  setup: TradeSetup;
  tweet: string;
  handle: string;
  timestamp: number;
  livePriceData: { price: number; change24h?: number };
  tweetUrl?: string;
  authorAvatar?: string;
}

export interface SignalFeedItem extends PendingSignal {
  id: string;
  isRead: boolean;
  detectedAt: number;
}

export type LanguageCode =
  | "en"
  | "fr"
  | "es"
  | "de"
  | "zh"
  | "it"
  | "pt"
  | "hi";

export const SUPPORTED_LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
];

export interface UserUsageStats {
  scansToday: number;
  analysesToday: number;
  trackersCount: number;
  lastResetDate?: string; 
  lastScanDate?: number;
  totalLifetimeScans: number;
  totalLifetimeAnalyses: number;
  totalLifetimeTrackers: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  tier: SubscriptionTier;
  credits: number;
  usage: UserUsageStats;
}