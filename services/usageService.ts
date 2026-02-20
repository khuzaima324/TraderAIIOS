import firestore from "@react-native-firebase/firestore";
import { Alert } from "react-native";
import { PLAN_LIMITS } from "../config/plans";
import { SubscriptionTier, UserProfile } from "../types";

// Helper: Returns true if the timestamp is from today
const isSameDay = (timestamp?: number) => {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const checkUsageLimit = (
  user: UserProfile,
  feature: "manualScans" | "chartAnalysis" | "trackers",
  onUpgradePress?: () => void,
): boolean => {
  // Unlimited chart analysis for paid users (Pro/Plus)
  const isPaidTier =
    user.tier === SubscriptionTier.PRO || user.tier === SubscriptionTier.PLUS;
  if (feature === "chartAnalysis" && isPaidTier) {
    return true;
  }

  const plan = PLAN_LIMITS[user.tier];
  let limit = 0;
  let current = 0;

  // 1. TRACKER LIMITS (Always based on active count)
  if (feature === "trackers") {
    limit = plan.trackers;
    current = user.usage.trackersCount;
  }

  // 2. FREE USER LIMITS (Lifetime)
  // This logic runs if your plan says "LIFETIME" (which your Free plan does)
  else if ((plan as any).resetPeriod === "LIFETIME") {
    limit = plan[feature];
    // Check total lifetime usage. It never resets.
    current =
      feature === "manualScans"
        ? user.usage.totalLifetimeScans
        : user.usage.totalLifetimeAnalyses;
  }

  // 3. PAID USER LIMITS (Daily)
  // This logic runs for Plus/Pro users
  else {
    limit = plan[feature];

    // Check if the last scan was TODAY
    const lastDate = user.usage.lastScanDate || 0;
    const isToday = isSameDay(lastDate);

    // If last scan was yesterday, your usage today is 0.
    if (feature === "manualScans") {
      current = isToday ? user.usage.scansToday : 0;
    } else {
      current = isToday ? user.usage.analysesToday : 0;
    }
  }

  if (current >= limit) {
    let message = `You have reached your limit of ${limit}. Upgrade for more!`;

    // Specific message for Free users
    if (
      user.tier === SubscriptionTier.FREE &&
      (plan as any).resetPeriod === "LIFETIME"
    ) {
      message = `You have used your 1 free ${feature === "manualScans" ? "scan" : "analysis"}. This is a lifetime limit for free accounts.`;
    }

    Alert.alert("Limit Reached", message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Upgrade",
        style: "default",
        onPress: () => {
          if (onUpgradePress) onUpgradePress();
        },
      },
    ]);
    return false;
  }

  return true;
};

export const incrementUsage = async (
  userId: string,
  feature: "manualScans" | "chartAnalysis",
  userTier?: SubscriptionTier,
) => {
  const isPaidTier =
    userTier === SubscriptionTier.PRO || userTier === SubscriptionTier.PLUS;

  // Unlimited chart analysis for paid users? Don't increment.
  if (feature === "chartAnalysis" && isPaidTier) return;

  const userRef = firestore().collection("users").doc(userId);

  // Get current data to check the date
  const userSnap = await userRef.get();
  const userData = userSnap.data();
  const lastDate = userData?.usage?.lastScanDate || 0;
  const isToday = isSameDay(lastDate);

  const updates: any = {};
  const dailyKey =
    feature === "manualScans" ? "usage.scansToday" : "usage.analysesToday";

  // If it's a new day, reset daily counter to 1. If today, add 1.
  if (isToday) {
    updates[dailyKey] = firestore.FieldValue.increment(1);
  } else {
    updates[dailyKey] = 1;
  }

  // Always update the date to "Now"
  updates["usage.lastScanDate"] = Date.now();

  // Always increment LIFETIME stats (This locks out the Free users)
  const lifetimeKey =
    feature === "manualScans"
      ? "usage.totalLifetimeScans"
      : "usage.totalLifetimeAnalyses";
  updates[lifetimeKey] = firestore.FieldValue.increment(1);

  await userRef.update(updates);
};

// Keep existing tracker logic
export const changeTrackerCount = async (
  userId: string,
  action: "add" | "remove",
) => {
  const userRef = firestore().collection("users").doc(userId);
  const updates: any = {};
  const amount = action === "add" ? 1 : -1;
  updates["usage.trackersCount"] = firestore.FieldValue.increment(amount);
  if (action === "add") {
    updates["usage.totalLifetimeTrackers"] = firestore.FieldValue.increment(1);
  }
  await userRef.update(updates);
};