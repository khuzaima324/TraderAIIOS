import firestore from "@react-native-firebase/firestore";
import {
  HistoryItem,
  SignalFeedItem,
  SubscriptionTier,
  TrackedAccount,
} from "../types";

export interface UserData {
  tier: SubscriptionTier;
  language: string;
  joinDate: number;
  soundEnabled?: boolean;
  pushToken?: string;
  credits: number;
  usage: {
    scansToday: number;
    analysesToday: number;
    trackersCount: number;
    totalLifetimeScans: number;
    totalLifetimeAnalyses: number;
    totalLifetimeTrackers: number;
  };
}

export const initializeUser = async (
  userId: string,
  email: string,
): Promise<UserData> => {
  const userRef = firestore().collection("users").doc(userId);
  const userSnap = await userRef.get();

  const existingData = userSnap.data() as UserData | undefined;

  if (!(userSnap as any).exists || !existingData?.usage) {
    const newUser: UserData = {
      tier: SubscriptionTier.FREE,
      language: "en",
      joinDate: Date.now(),
      soundEnabled: true,
      credits: 5,
      pushToken: existingData?.pushToken || undefined,
      usage: {
        scansToday: 0,
        analysesToday: 0,
        trackersCount: 0,
        totalLifetimeScans: 0,
        totalLifetimeAnalyses: 0,
        totalLifetimeTrackers: 0,
      },
    };

    await userRef.set(newUser, { merge: true });
    return newUser;
  }

  return existingData!;
};

export const saveDeviceToken = async (userId: string, token: string) => {
  await firestore().collection("users").doc(userId).set(
    {
      pushToken: token,
    },
    { merge: true },
  );

  console.log("💾 Token Saved/Updated");
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userSnap = await firestore().collection("users").doc(userId).get();

    if ((userSnap as any).exists) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const getWatchlist = async (
  userId: string,
): Promise<TrackedAccount[]> => {
  const snapshot = await firestore()
    .collection("users")
    .doc(userId)
    .collection("trackers")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as TrackedAccount[];
};

export const addWatchlistItem = async (
  userId: string,
  account: TrackedAccount,
) => {
  const trackersRef = firestore()
    .collection("users")
    .doc(userId)
    .collection("trackers");
  const ref = account.id ? trackersRef.doc(account.id) : trackersRef.doc();

  await ref.set(
    {
      ...account,
      id: ref.id,
      createdAt: Date.now(),
    },
    { merge: true },
  );
};

export const removeWatchlistItem = async (
  userId: string,
  accountId: string,
) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .collection("trackers")
    .doc(accountId)
    .delete();
};

export const updateWatchlistItem = async (
  userId: string,
  account: TrackedAccount,
) => {
  if (!account.id) return;
  await firestore()
    .collection("users")
    .doc(userId)
    .collection("trackers")
    .doc(account.id)
    .update({ ...account });
};

export const getHistory = async (userId: string): Promise<HistoryItem[]> => {
  const snapshot = await firestore()
    .collection("users")
    .doc(userId)
    .collection("history")
    .orderBy("timestamp", "desc")
    .limit(50)
    .get();

  return snapshot.docs.map((doc) => doc.data() as HistoryItem);
};

export const addHistoryItem = async (userId: string, item: HistoryItem) => {
  const historyRef = firestore()
    .collection("users")
    .doc(userId)
    .collection("history");
  const itemRef = item.id ? historyRef.doc(item.id) : historyRef.doc();
  await itemRef.set({ ...item, id: itemRef.id });
};

export const removeHistoryItem = async (userId: string, itemId: string) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .collection("history")
    .doc(itemId)
    .delete();
};

export const getSignals = async (userId: string): Promise<SignalFeedItem[]> => {
  const snapshot = await firestore()
    .collection("users")
    .doc(userId)
    .collection("signals")
    .orderBy("detectedAt", "desc")
    .limit(100)
    .get();

  return snapshot.docs.map((doc) => doc.data() as SignalFeedItem);
};

export const addSignal = async (userId: string, signal: SignalFeedItem) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .collection("signals")
    .doc(signal.id)
    .set(signal);
};

export const removeSignal = async (userId: string, signalId: string) => {
  try {
    await firestore()
      .collection("users")
      .doc(userId)
      .collection("signals")
      .doc(signalId)
      .delete();
  } catch (error) {
    console.error("Error removing signal from database:", error);
    throw error;
  }
};

export const updateUserTier = async (
  userId: string,
  tier: SubscriptionTier,
) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .set({ tier }, { merge: true });
};

export const updateUserLanguage = async (userId: string, language: string) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .set({ language }, { merge: true });
};

export const updateUserSound = async (userId: string, enabled: boolean) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .set({ soundEnabled: enabled }, { merge: true });
};

export const updateUserCredits = async (userId: string, credits: number) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .set({ credits }, { merge: true });
};

export const updateUsageStats = async (
  userId: string,
  updates: Partial<UserData>,
) => {
  await firestore()
    .collection("users")
    .doc(userId)
    .set(updates, { merge: true });
};