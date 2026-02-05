import firestore from "@react-native-firebase/firestore";
import { Alert } from "react-native";
import { PLAN_LIMITS } from "../config/plans";
import { SubscriptionTier, UserProfile } from "../types";

export const checkUsageLimit = (
  user: UserProfile,
  feature: "manualScans" | "chartAnalysis" | "trackers",
  onUpgradePress?: () => void,
): boolean => {
  const isPaidTier =
    user.tier === SubscriptionTier.PRO || user.tier === SubscriptionTier.PLUS;
  if (feature === "chartAnalysis" && isPaidTier) {
    return true;
  }

  const plan = PLAN_LIMITS[user.tier];
  let limit = 0;
  let current = 0;

  if (feature === "trackers") {
    limit = plan.trackers; // e.g., 1 for Basic, 5 for Pro

    if (user.tier === SubscriptionTier.FREE) {
      current = (user.usage as any).totalLifetimeTrackers || 0;
    } else {
      current = user.usage.trackersCount;
    }
  } else {
    if (plan.resetPeriod === "LIFETIME") {
      limit = plan[feature];
      current =
        feature === "manualScans"
          ? user.usage.totalLifetimeScans
          : user.usage.totalLifetimeAnalyses;
    } else {
      limit = plan[feature];
      current =
        feature === "manualScans"
          ? user.usage.scansToday
          : user.usage.analysesToday;
    }
  }

  if (current >= limit) {
    const isBasicTrackerLimit =
      feature === "trackers" && user.tier === SubscriptionTier.FREE;
    const message = isBasicTrackerLimit
      ? "Free plan allows adding only 1 tracker per lifetime. Upgrade to add more or swap trackers!"
      : `You have reached your limit of ${limit}. Upgrade for more!`;

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
  if (feature === "chartAnalysis" && isPaidTier) return;

  const userRef = firestore().collection("users").doc(userId);
  const updates: any = {};

  const dailyKey =
    feature === "manualScans" ? "usage.scansToday" : "usage.analysesToday";
  updates[dailyKey] = firestore.FieldValue.increment(1);

  const lifetimeKey =
    feature === "manualScans"
      ? "usage.totalLifetimeScans"
      : "usage.totalLifetimeAnalyses";
  updates[lifetimeKey] = firestore.FieldValue.increment(1);

  await userRef.update(updates);
};

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