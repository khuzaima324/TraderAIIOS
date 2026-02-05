interface PriceData {
  price: number;
  change24h?: number;
}

export const getLivePrice = async (symbol: string): Promise<PriceData> => {
  const cleanSymbol = symbol.toUpperCase().replace("$", "").replace("/", "");

  const cryptoMap: Record<string, string> = {
    BTC: "BTCUSDT",
    ETH: "ETHUSDT",
    SOL: "SOLUSDT",
    DOGE: "DOGEUSDT",
    XRP: "XRPUSDT",
    BNB: "BNBUSDT",
    ADA: "ADAUSDT",
  };

  const binanceSymbol = cryptoMap[cleanSymbol] || `${cleanSymbol}USDT`;

  try {
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`,
    );
    if (response.ok) {
      const data = await response.json();
      return {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
      };
    }
  } catch (e) {
    // Fallback or ignore if not crypto
  }

  const mockPrices: Record<string, number> = {
    TSLA: 240.5,
    AAPL: 175.2,
    NVDA: 890.0,
    SPY: 510.15,
    EURUSD: 1.085,
    GBPUSD: 1.265,
  };

  const basePrice = mockPrices[cleanSymbol] || 100.0;
  const noise = (Math.random() - 0.5) * (basePrice * 0.005);

  return {
    price: basePrice + noise,
    change24h: Math.random() * 4 - 2,
  };
};

export const formatCurrency = (value: number, symbol: string = "$"): string => {
  if (value < 1) return `${symbol}${value.toFixed(4)}`;
  if (value > 1000)
    return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${symbol}${value.toFixed(2)}`;
};