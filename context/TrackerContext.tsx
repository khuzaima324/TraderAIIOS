import firestore from "@react-native-firebase/firestore";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";
import {
  addWatchlistItem,
  getSignals,
  getWatchlist,
  removeSignal,
  removeWatchlistItem,
} from "../services/database";
import { playErrorSound, playSuccessSound } from "../services/soundService";
import {
  performScan as servicePerformScan,
  TrackerService,
} from "../services/trackerService";
import { changeTrackerCount, checkUsageLimit } from "../services/usageService";
import {
  SignalFeedItem,
  SubscriptionTier,
  TrackedAccount,
  UserProfile,
} from "../types";
import { useAuth } from "./AuthContext";

interface TrackerContextType {
  trackedAccounts: TrackedAccount[];
  signals: SignalFeedItem[];
  isScanning: string | null;
  refreshData: () => Promise<void>;
  scanAccount: (account: TrackedAccount) => Promise<void>;
  handleAddAccount: (account: TrackedAccount) => Promise<void>;
  handleRemoveAccount: (id: string) => Promise<void>;
  handleRemoveSignal: (id: string) => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export const TrackerProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [trackedAccounts, setTrackedAccounts] = useState<TrackedAccount[]>([]);
  const [signals, setSignals] = useState<SignalFeedItem[]>([]);
  const [isScanning, setIsScanning] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    try {
      const accounts = await getWatchlist(user.uid);
      const userSignals = await getSignals(user.uid);
      setTrackedAccounts(accounts);
      setSignals(userSignals);
    } catch (error) {
      console.error("Failed to load tracker data", error);
    }
  };

  const handleAddAccount = async (account: TrackedAccount) => {
    if (!user) return;

    try {
      const userRef = firestore().collection("users").doc(user.uid);
      const userSnap = await userRef.get();

      if ((userSnap as any).exists) {
        const userData = userSnap.data() || {};

        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || "",
          tier: (userData?.tier as SubscriptionTier) || SubscriptionTier.FREE,
          credits: userData?.credits || 0,
          name: userData?.name || "User",
          avatarUrl: userData?.avatarUrl || "",
          usage: {
            scansToday: 0,
            analysesToday: 0,
            totalLifetimeScans: 0,
            totalLifetimeAnalyses: 0,
            totalLifetimeTrackers: 0,
            ...(userData?.usage || {}),
            trackersCount: trackedAccounts.length,
          },
        };

        const isAllowed = checkUsageLimit(userProfile, "trackers");
        if (!isAllowed) return;
      }

      setTrackedAccounts((prev) => [...prev, account]);

      await addWatchlistItem(user.uid, account);
      await changeTrackerCount(user.uid, "add");
      await TrackerService.subscribe(account.handle);

      await playSuccessSound();
    } catch (error) {
      setTrackedAccounts((prev) => prev.filter((a) => a.id !== account.id));
      console.error("Add Account Error:", error);
      await playErrorSound();
      Alert.alert("Error", "Failed to add account. Check connection.");
    }
  };

  const handleRemoveAccount = async (id: string) => {
    if (!user) return;

    // Find account to get handle (needed for unsubscribe)
    const accountToRemove = trackedAccounts.find((a) => a.id === id);
    const previous = [...trackedAccounts];

    setTrackedAccounts((prev) => prev.filter((acc) => acc.id !== id));

    try {
      await removeWatchlistItem(user.uid, id);
      await changeTrackerCount(user.uid, "remove");

      if (accountToRemove) {
        await TrackerService.unsubscribe(accountToRemove.handle);
      }
    } catch (error) {
      setTrackedAccounts(previous);
      Alert.alert("Error", "Failed to remove account.");
    }
  };

  const handleRemoveSignal = async (id: string) => {
    if (!user) return;

    const previousSignals = [...signals];
    setSignals((prev) => prev.filter((s) => s.id !== id));

    try {
      await removeSignal(user.uid, id);
    } catch (error) {
      console.error("Sync error:", error);
      setSignals(previousSignals);
    }
  };

  // Uses the Service Logic (which calls the Server or Local AI)
  const scanAccount = async (account: TrackedAccount) => {
    if (!user) return;
    setIsScanning(account.id);

    try {
      // Delegate to service
      const newSignal = await servicePerformScan(user.uid, account);

      if (newSignal) {
        setSignals((prev) => [newSignal, ...prev]);
        await playSuccessSound();
        Alert.alert(
          "Signal Detected 🚀",
          "A new potential trade found! Check the Signals tab.",
          [{ text: "OK", style: "default" }],
        );
      } else {
        Alert.alert(
          "No New Signal",
          "Analysis complete. No strong setup found.",
        );
      }
    } catch (error) {
      console.error("Scan Error:", error);
      Alert.alert("Scan Failed", "Could not connect to analysis engine.");
      await playErrorSound();
    } finally {
      setIsScanning(null);
    }
  };

  return (
    <TrackerContext.Provider
      value={{
        trackedAccounts,
        signals,
        isScanning,
        refreshData,
        scanAccount,
        handleAddAccount,
        handleRemoveAccount,
        handleRemoveSignal,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};

export const useTracker = () => {
  const context = useContext(TrackerContext);
  if (!context)
    throw new Error("useTracker must be used within a TrackerProvider");
  return context;
};