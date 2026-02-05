import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import firestore from "@react-native-firebase/firestore";
import { LanguageCode, SUPPORTED_LANGUAGES, TradeSetup } from "../types";

const DEFAULT_GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const DEFAULT_PRIMARY_KEY = process.env.EXPO_PUBLIC_TWITTER_PRIMARY || "";
const DEFAULT_BACKUP_KEY = process.env.EXPO_PUBLIC_TWITTER_BACKUP || "";

// Twitter URLs
const PRIMARY_SEARCH_URL =
  "https://api.twitterapi.io/twitter/tweet/advanced_search";
const BACKUP_SEARCH_URL = "https://api.twitterxapi.com/twitter/advanced_search";

const getSecrets = async () => {
  try {
    const doc = await firestore().collection("app_config").doc("secrets").get();
    const data = doc.data() || {};
    return {
      gemini: data.gemini_api_key || DEFAULT_GEMINI_KEY,
      twitterPrimary: data.twitter_primary_key || DEFAULT_PRIMARY_KEY,
      twitterBackup: data.twitter_backup_key || DEFAULT_BACKUP_KEY,
    };
  } catch (error) {
    return {
      gemini: DEFAULT_GEMINI_KEY,
      twitterPrimary: DEFAULT_PRIMARY_KEY,
      twitterBackup: DEFAULT_BACKUP_KEY,
    };
  }
};

// SAFETY HELPER
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const result: any = {};
  for (const key in obj) {
    const value = obj[key];
    if (value === undefined) {
      result[key] = null;
    } else if (typeof value === "object") {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
};

//  CHART ANALYZER (MATCHING WEB APP)

const chartSchema = {
  type: SchemaType.OBJECT,
  properties: {
    isChart: {
      type: SchemaType.BOOLEAN,
      description:
        "Set to TRUE if the image is a financial trading chart. Set to FALSE if it is anything else.",
    },
    asset: { type: SchemaType.STRING },
    symbol: { type: SchemaType.STRING },
    direction: { type: SchemaType.STRING, enum: ["LONG", "SHORT", "NEUTRAL"] },
    reasoning: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
    entryPrice: { type: SchemaType.STRING },
    stopLoss: { type: SchemaType.STRING },
    takeProfit: { type: SchemaType.STRING },
    takeProfit2: { type: SchemaType.STRING },
    takeProfit3: { type: SchemaType.STRING },
    support: { type: SchemaType.STRING },
    resistance: { type: SchemaType.STRING },
    riskRewardRatio: { type: SchemaType.STRING },

    advanced: {
      type: SchemaType.OBJECT,
      properties: {
        marketStructure: {
          type: SchemaType.OBJECT,
          properties: {
            trend: {
              type: SchemaType.STRING,
              description: "Uptrend, Downtrend, or Consolidation",
            },
            structureType: {
              type: SchemaType.STRING,
              description: "e.g. Higher Highs/Lows, Lower Highs/Lows",
            },
            breakOfStructure: {
              type: SchemaType.STRING,
              description: "Note any BOS or 'None'",
            },
            changeOfCharacter: {
              type: SchemaType.STRING,
              description: "Note any CHoCH or 'None'",
            },
          },
        },
        keyLevels: {
          type: SchemaType.OBJECT,
          properties: {
            supplyZones: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            demandZones: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            fairValueGaps: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            orderBlocks: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
        },
        patterns: {
          type: SchemaType.OBJECT,
          properties: {
            candlePatterns: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            chartPatterns: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
        },
        volumeMomentum: {
          type: SchemaType.STRING,
          description: "Insights on volume, divergence, or momentum shifts",
        },
        indicators: {
          type: SchemaType.STRING,
          description: "RSI, MACD, EMAs interpretation if visible",
        },
        liquidityMap: {
          type: SchemaType.OBJECT,
          properties: {
            sweepLevels: {
              type: SchemaType.STRING,
              description: "Where stop hunts might occur",
            },
            magnetZones: {
              type: SchemaType.STRING,
              description: "Untapped liquidity pools",
            },
          },
        },
        strategy: {
          type: SchemaType.OBJECT,
          properties: {
            suggestedType: {
              type: SchemaType.STRING,
              description: "Scalp, Day Trade, Swing, or Avoid",
            },
            warning: {
              type: SchemaType.STRING,
              description: "News, high volatility, or fakeout warnings",
            },
          },
        },
      },
    },
  },
  required: [
    "isChart",
    "asset",
    "symbol",
    "direction",
    "reasoning",
    "confidence",
    "entryPrice",
    "stopLoss",
    "takeProfit",
  ],
};

export const analyzeChartImage = async (
  base64Image: string,
  language: LanguageCode = "en",
): Promise<TradeSetup> => {
  try {
    const keys = await getSecrets();
    const genAI = new GoogleGenerativeAI(keys.gemini);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: chartSchema as any,
        temperature: 0.1,
      },
    });

    const langName =
      SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label || "English";

    const prompt = `You are a Senior Technical Analyst at a top Hedge Fund. Analyze this chart image deeply.
            
            STEP 1: VALIDATION
            Is this image a financial trading chart? If NO, set isChart=FALSE.

            STEP 2: ADVANCED ANALYSIS
            1. Market Structure: Identify trend (HH/HL or LH/LL), Break of Structure (BOS), and Change of Character (BOS).
            2. Key Levels: Supply/Demand zones, Fair Value Gaps (FVG), and Order Blocks.
            3. Patterns: Detect candlestick patterns (Hammer, Engulfing, etc.) and chart patterns (Head & Shoulders, Flags).
            4. Volume & Momentum: Infer divergence, exhaustion, or squeeze setups.
            5. Indicators: Interpret RSI, MACD, or EMAs if visible.
            6. Liquidity: Identify stop-hunt zones and liquidity sweeps.
            7. Risk Management: Entry, Stop Loss, TP1, TP2, TP3.
            8. Strategy: Is this a scalp, swing, or trap?

            IMPORTANT: Return detailed data in the structured JSON format provided.
            Translate the reasoning and textual fields (trend, structureType, patterns, volumeMomentum, warning, strategy) into ${langName}.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/png", data: base64Image } },
    ]);

    const text = result.response.text();
    const data = JSON.parse(text);

    return sanitizeObject({
      ...data,
      entryPrice: data.entryPrice || "See Chart",
      stopLoss: data.stopLoss || "See Chart",
      takeProfit: data.takeProfit || "See Chart",
      advanced: {
        marketStructure: data.advanced?.marketStructure || {
          trend: "Neutral",
          structureType: "Consolidation",
        },
        keyLevels: data.advanced?.keyLevels || {
          fairValueGaps: [],
          orderBlocks: [],
        },
        patterns: data.advanced?.patterns || {
          candlePatterns: [],
          chartPatterns: [],
        },
        liquidityMap: data.advanced?.liquidityMap || {
          sweepLevels: "None",
          magnetZones: "None",
        },
        strategy: data.advanced?.strategy || {
          suggestedType: "Day Trade",
          warning: "Manage Risk",
        },
        volumeMomentum: data.advanced?.volumeMomentum || "Neutral",
      },
    });
  } catch (error) {
    console.warn("Chart Analysis Failed:", error);
    return sanitizeObject({
      isChart: true,
      asset: "ERROR",
      symbol: "ERROR",
      direction: "NEUTRAL",
      reasoning: "Analysis failed or timed out.",
      confidence: 0,
      entryPrice: "0",
      stopLoss: "0",
      takeProfit: "0",
      advanced: null,
    });
  }
};

const tweetSchema = {
  type: SchemaType.OBJECT,
  properties: {
    symbol: {
      type: SchemaType.STRING,
      description: "The crypto ticker (e.g. BTC, ETH)",
    },
    direction: { type: SchemaType.STRING, enum: ["LONG", "SHORT", "NEUTRAL"] },
    confidence: { type: SchemaType.NUMBER, description: "0 to 100" },
    reasoning: { type: SchemaType.STRING },
    entryPrice: { type: SchemaType.STRING, nullable: true },
    stopLoss: { type: SchemaType.STRING, nullable: true },
    takeProfit: { type: SchemaType.STRING, nullable: true },
  },
  required: ["symbol", "direction", "confidence", "reasoning"],
};

export const analyzeTweetSignal = async (
  tweetText: string,
  apiKey: string,
): Promise<any> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction:
        "You are a financial algo. Extract the ticker symbol precisely. Ignore spam footers.",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: tweetSchema as any,
        temperature: 0.1,
      },
    });

    const prompt = `Analyze this tweet for financial signals: "${tweetText}". 
    
    TASKS:
    1. Identify the ticker symbol (e.g. BTC, ETH, SOL). If unsure, guess the most likely one based on context.
    2. Determine direction (LONG/SHORT/NEUTRAL).
    3. Confidence level (0-100).
    4. Extract Entry, SL, and TP if available (or return null).
    5. Brief reasoning.`;

    console.log("🤖 AI Analyzing:", tweetText);

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    console.log("🤖 AI Result:", data);

    const isValidSignal =
      data.direction !== "NEUTRAL" &&
      data.direction !== null &&
      (data.confidence || 0) > 60;

    return {
      ...data,
      isSignal: isValidSignal,
      entryPrice: data.entryPrice || "Market",
      stopLoss: data.stopLoss || "Dynamic",
      takeProfit: data.takeProfit || "Dynamic",
      riskRewardRatio: "1:2",
    };
  } catch (error) {
    console.warn("Gemini Analysis Failed:", error);
    return {
      isSignal: false,
      symbol: "UNKNOWN",
      direction: "NEUTRAL",
      confidence: 0,
      reasoning: "AI Error",
    };
  }
};

async function fetchFromBackup(
  handle: string,
  sinceUnix: number,
  apiKey: string,
) {
  console.log("Switching to Backup API...");
  try {
    const query = `from:${handle} since_time:${sinceUnix} include:nativeretweets`;

    const response = await fetch(BACKUP_SEARCH_URL, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        searchTerms: [query], // Twex API uses array
        queryType: "Latest",
      }),
    });

    if (!response.ok) return null;
    const json = await response.json();
    const tweets = json.tweets || json.data || [];

    if (!tweets || tweets.length === 0) return null;

    const latest = tweets[0];
    const timestamp = latest.createdAt
      ? new Date(latest.createdAt).getTime()
      : latest.created_at_datetime
        ? new Date(latest.created_at_datetime).getTime()
        : Date.now();

    if (Date.now() - timestamp > 6 * 60 * 1000) return null;

    return {
      id: latest.id || latest.tweet_id || String(Date.now()),
      text: latest.text || latest.full_text || "",
      timestamp: timestamp,
      authorHandle: handle,
    };
  } catch (error) {
    return null;
  }
}

export const fetchLatestTweet = async (handle: string): Promise<any | null> => {
  const cleanHandle = handle.replace("@", "");
  console.log(`Starting Scan for ${cleanHandle}...`);

  try {
    const keys = await getSecrets();
    const sixMinutesAgoUnix = Math.floor((Date.now() - 6 * 60 * 1000) / 1000);
    const query = `from:${cleanHandle} since_time:${sixMinutesAgoUnix} include:nativeretweets`;

    let tweetData = null;

    // Try Primary key
    try {
      console.log(`📡 Fetching Primary API...`);
      const url = `${PRIMARY_SEARCH_URL}?query=${encodeURIComponent(query)}&queryType=Latest`;

      const response = await fetch(url, {
        method: "GET",
        headers: { "X-API-Key": keys.twitterPrimary },
      });

      if (response.status === 429 || response.status >= 500 || !response.ok) {
        throw new Error(`Primary API Error: ${response.status}`);
      }

      const data = await response.json();
      const tweets = data.tweets || [];

      if (tweets && tweets.length > 0) {
        const latest = tweets[0];
        tweetData = {
          id: latest.id,
          text: latest.text,
          timestamp: new Date().toISOString(),
          authorHandle: cleanHandle,
        };
      }
    } catch (primaryError) {
      console.warn("Primary API failed, trying backup...");
      const backupResult = await fetchFromBackup(
        cleanHandle,
        sixMinutesAgoUnix,
        keys.twitterBackup,
      );
      if (backupResult) {
        tweetData = {
          id: backupResult.id,
          text: backupResult.text,
          timestamp: new Date(backupResult.timestamp).toISOString(),
          authorHandle: cleanHandle,
        };
      }
    }

    if (!tweetData) {
      console.log(" No new tweets found.");
      return { success: false, message: "No recent tweets." };
    }

    console.log("Tweet Found. Running Analysis...");
    const analysis = await analyzeTweetSignal(tweetData.text, keys.gemini);

    return sanitizeObject({
      success: true,
      tweet: tweetData,
      isChart: true,
      asset: analysis.symbol || "UNKNOWN",
      symbol: analysis.symbol || "UNK",
      direction: analysis.direction || "NEUTRAL",
      reasoning: analysis.reasoning || "Analysis complete.",
      confidence: analysis.confidence || 85,
      isSignal: analysis.isSignal || false,
      entryPrice: analysis.entryPrice || "Market",
      stopLoss: analysis.stopLoss || "Dynamic",
      takeProfit: analysis.takeProfit || "Dynamic",
      riskRewardRatio: "1:2",
    });
  } catch (error) {
    console.error("Scan Critical Failure:", error);
    return { success: false, message: "App Error" };
  }
};