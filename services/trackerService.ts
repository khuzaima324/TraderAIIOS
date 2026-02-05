import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { SignalFeedItem, TrackedAccount, TradeDirection } from "../types";
import { addSignal, updateWatchlistItem } from "./database";
import { fetchLatestTweet } from "./geminiService";
import { sendLocalNotification } from "./pushService";

const SUB_PREFIX = "tracker_sub_";

export const TrackerService = {
  subscribe: async (trackerName: string) => {
    const topic = `signal_${trackerName.replace(/\s+/g, "")}`;
    try {
      await messaging().subscribeToTopic(topic);
      await AsyncStorage.setItem(`${SUB_PREFIX}${trackerName}`, "true");
      console.log(`Subscribed to ${topic}`);
    } catch (error) {
      console.error("Subscribe failed:", error);
      throw error;
    }
  },

  unsubscribe: async (trackerName: string) => {
    const topic = `signal_${trackerName.replace(/\s+/g, "")}`;
    try {
      await messaging().unsubscribeFromTopic(topic);
      await AsyncStorage.setItem(`${SUB_PREFIX}${trackerName}`, "false");
      console.log(`Unsubscribed from ${topic}`);
    } catch (error) {
      console.error("Unsubscribe failed:", error);
      throw error;
    }
  },

  isSubscribed: async (trackerName: string): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(`${SUB_PREFIX}${trackerName}`);
      return val === "true";
    } catch (error) {
      return false;
    }
  },
};

export const performScan = async (userId: string, account: TrackedAccount) => {
  console.log(`Manual Scan started for: ${account.handle}`);
  try {
    const result = await fetchLatestTweet(account.handle);

    if (!result || !result.success || !result.tweet) {
      console.log(`Scan ended early: ${result?.message || "No result"}`);
      return null;
    }

    if (account.lastScannedTweetId === result.tweet.id) {
      console.log("Tweet already scanned (Duplicate). Skipping.");
      return null; // Stop here! Don't save it again.
    }

    if (result.isSignal === false) {
      console.log("AI detected Spam/News. Skipping database save.");
      await updateWatchlistItem(userId, {
        ...account,
        lastScannedTweetId: result.tweet.id,
      });
      return null;
    }

    let directionEnum = TradeDirection.NEUTRAL;
    if (result.direction === "LONG") directionEnum = TradeDirection.LONG;
    if (result.direction === "SHORT") directionEnum = TradeDirection.SHORT;

    const newSignal: SignalFeedItem = {
      id: "sig_" + Date.now(),
      isRead: false,
      detectedAt: Date.now(),
      tweet: result.tweet.text,
      handle: account.handle,
      tweetTimestamp: new Date(result.tweet.timestamp).getTime(),
      livePriceData: { price: 0, change24h: 0 },
      tweetUrl: `https://twitter.com/${account.handle}/status/${result.tweet.id}`,
      authorAvatar: account.avatarUrl || "",

      setup: {
        isChart: result.isChart || false,
        asset: result.asset || result.symbol || "UNK",
        symbol: result.symbol || "UNK",
        direction: directionEnum,
        entryPrice: result.entryPrice || "Market",
        stopLoss: result.stopLoss || "Dynamic",
        takeProfit: result.takeProfit || "Dynamic",
        riskRewardRatio: result.riskRewardRatio || "1:2",
        reasoning: result.reasoning || "No reasoning provided.",
        confidence: result.confidence || 0,
      },
    };

    console.log(" Saving Valid Signal to DB...");
    await addSignal(userId, newSignal);

    await updateWatchlistItem(userId, {
      ...account,
      lastScannedTweetId: result.tweet.id,
    });

    await sendLocalNotification(
      "Signal Detected 🚀",
      `New setup for ${newSignal.setup.symbol}!`,
    );

    return newSignal;
  } catch (error) {
    console.error("Manual Scan Error:", error);
    throw error;
  }
};