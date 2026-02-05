import { Ionicons } from "@expo/vector-icons";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { PLAN_LIMITS } from "../config/plans";
import { useAuth } from "../context/AuthContext";
import { useTracker } from "../context/TrackerContext";

import {
  playHapticClick,
  playScanStart,
  playSuccessSound,
} from "../services/soundService";
import { TrackerService } from "../services/trackerService";
import { translations } from "../services/translations";
import {
  changeTrackerCount,
  checkUsageLimit,
  incrementUsage,
} from "../services/usageService";
import { LanguageCode, SubscriptionTier, UserProfile } from "../types";
import {
  GlassBox,
  GlassButton,
  GlassInput,
  SegmentedControl,
} from "./GlassComponents";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SUGGESTIONS = {
  CRYPTO: [
    { handle: "elonmusk", name: "Elon Musk" },
    { handle: "realDonaldTrump", name: "Donald J. Trump" },
    { handle: "Pentosh1", name: "Pentoshi 🐧" },
    { handle: "Cobie", name: "Cobie" },
    { handle: "WillClementeIII", name: "Will Clemente" },
    { handle: "TheRealPlanC", name: "PlanC" },
    { handle: "TechDev_52", name: "TechDev" },
    { handle: "100trillionUSD", name: "PlanB" },
    { handle: "woonomic", name: "Willy Woo" },
    { handle: "PeterLBrandt", name: "Peter Brandt" },
    { handle: "AltcoinPsycho", name: "Altcoin Psycho" },
    { handle: "CryptoCred", name: "Cred" },
    { handle: "TheCryptoDog", name: "The Crypto Dog" },
    { handle: "loomdart", name: "Loomdart" },
    { handle: "DegenSpartan", name: "Degen Spartan" },
    { handle: "HsakaTrades", name: "Hsaka" },
    { handle: "RektCapital", name: "Rekt Capital" },
    { handle: "Kaleo", name: "K A L E O" },
    { handle: "CredibleCrypto", name: "Credible Crypto" },
    { handle: "DonAlt", name: "DonAlt" },
    { handle: "Trader_XO", name: "XO" },
  ],
  STOCKS: [
    { handle: "realDonaldTrump", name: "Donald J. Trump" },
    { handle: "MarkMinervini", name: "Mark Minervini" },
    { handle: "DanZanger", name: "Dan Zanger" },
    { handle: "TrendSpider", name: "TrendSpider" },
    { handle: "IBDinvestors", name: "IBD Investors" },
    { handle: "jimcramer", name: "Jim Cramer" },
    { handle: "Stocktwits", name: "Stocktwits" },
    { handle: "WSJmarkets", name: "WSJ Markets" },
    { handle: "MarketWatch", name: "MarketWatch" },
    { handle: "BloombergMarkets", name: "Bloomberg Markets" },
    { handle: "CNBC", name: "CNBC" },
    { handle: "TheStreet", name: "TheStreet" },
    { handle: "YahooFinance", name: "Yahoo Finance" },
    { handle: "BespokeInvest", name: "Bespoke Investment" },
    { handle: "RedDogT3", name: "Scott Redler" },
    { handle: "alphatrends", name: "Brian Shannon" },
    { handle: "howardlindzon", name: "Howard Lindzon" },
    { handle: "InvestorsLive", name: "Nathan Michaud" },
  ],
  FOREX: [
    { handle: "BabyPips", name: "BabyPips" },
    { handle: "ForexLive", name: "ForexLive" },
    { handle: "DailyFX", name: "DailyFX" },
    { handle: "FXStreetNews", name: "FXStreet" },
    { handle: "50Pips", name: "50 Pips" },
    { handle: "ForexFactory", name: "Forex Factory" },
    { handle: "KathyLienFX", name: "Kathy Lien" },
    { handle: "cvpayne", name: "Charles V Payne" },
    { handle: "zerohedge", name: "Zerohedge" },
    { handle: "BloombergTV", name: "Bloomberg TV" },
    { handle: "Reuters", name: "Reuters" },
    { handle: "Investingcom", name: "Investing.com" },
    { handle: "TradingView", name: "TradingView" },
    { handle: "CentralBankNews", name: "Central Bank News" },
    { handle: "ActionForex", name: "ActionForex" },
    { handle: "PipCrawl", name: "PipCrawl" },
  ],
};

interface TweetTrackerProps {
  language: LanguageCode;
}

export const TweetTracker: React.FC<TweetTrackerProps> = ({ language }) => {
  const router = useRouter();
  // const { user } = useAuth();
  const { user, subscriptionTier } = useAuth();
  const [isReady, setIsReady] = useState(false);
  const nextScanIndex = React.useRef(0);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        setIsReady(true);
      });

      return () => {
        task.cancel();
        setIsReady(false);
      };
    }, []),
  );

  const t = translations[language] || translations["en"];

  const {
    trackedAccounts,
    handleAddAccount,
    handleRemoveAccount,
    scanAccount,
    isScanning,
  } = useTracker();

  const [isAdding, setIsAdding] = useState(false);
  const [newHandle, setNewHandle] = useState("");
  const [suggestionCategory, setSuggestionCategory] = useState<
    "CRYPTO" | "STOCKS" | "FOREX"
  >("CRYPTO");

  const toggleAdding = () => {
    playHapticClick();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsAdding(!isAdding);
  };

  const performRemoveAccount = async (id: string, handle: string) => {
    if (!user) return;
    try {
      await TrackerService.unsubscribe(handle);
      await handleRemoveAccount(id);
      await changeTrackerCount(user.uid, "remove");
    } catch (error) {
      console.error("Remove failed:", error);
      Alert.alert("Error", "Failed to remove account. Check connection.");
    }
  };

  const addAccount = async (handle: string, name?: string) => {
    if (!user) return alert("Please log in.");

    console.log("AUTH USER UID:", auth().currentUser?.uid);
    try {
      const userSnap = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      const userData = userSnap.data() || {};

      const currentTier =
        (userData?.tier as SubscriptionTier) || SubscriptionTier.FREE;

      if (
        currentTier === SubscriptionTier.FREE &&
        trackedAccounts.length >= 1 &&
        (userData?.usage?.totalLifetimeTrackers || 0) >= 1
      ) {
        Alert.alert(
          "Limit Reached",
          "Free Plan allows only 1 tracker. Upgrade to add more.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Upgrade",
              onPress: () => router.push("/(tabs)/profile"),
              style: "default",
            },
          ],
        );
        return;
      }

      const realProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        tier: currentTier,
        credits: userData?.credits || 0,
        name: user.displayName || "User",
        avatarUrl: "",
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

      const canAdd = checkUsageLimit(realProfile, "trackers", () =>
        router.push("/(tabs)/profile"),
      );
      if (!canAdd) return;

      if (
        trackedAccounts.some(
          (a) => a.handle.toLowerCase() === handle.toLowerCase(),
        )
      ) {
        alert("Account already added");
        return;
      }

      const cleanHandle = handle.replace("@", "").trim();
      const newAcc: any = {
        id: Date.now().toString(),
        handle: cleanHandle,
        name: name || cleanHandle,
        avatarUrl: `https://unavatar.io/twitter/${cleanHandle}`,
        lastScannedTime: Date.now(),
      };

      if (typeof handleAddAccount === "function") {
        await handleAddAccount(newAcc);
        await TrackerService.subscribe(cleanHandle);
        await changeTrackerCount(user.uid, "add");
        await playSuccessSound();
      }

      if (newHandle && cleanHandle === newHandle.replace("@", "").trim()) {
        setNewHandle("");
      }
    } catch (err) {
      console.error("Add Account Error:", err);
      Alert.alert("Error", "Could not add account. Please check internet.");
    }
  };
  const planLimit = PLAN_LIMITS[subscriptionTier]?.trackers || 1;
  const activeTrackers = trackedAccounts.slice(0, planLimit);
  const lockedTrackers = trackedAccounts.slice(planLimit);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>{t.tracker_title || "Tracker"}</Text>
          <Text style={styles.headerSubtitle}>
            {t.manage_watchlist || "Manage Watchlist"}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={toggleAdding}>
          <Ionicons name={isAdding ? "close" : "add"} size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {!isReady ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isAdding && (
            <View style={{ marginBottom: 20 }}>
              <GlassBox style={{ marginBottom: 12, padding: 16 }}>
                <Text style={styles.cardTitle}>
                  {t.add_account || "Add New Account"}
                </Text>
                <View style={styles.inputRow}>
                  <View style={{ flex: 1, justifyContent: "center" }}>
                    <GlassInput
                      iconName="logo-twitter"
                      placeholder="@username"
                      value={newHandle}
                      onChangeText={setNewHandle}
                      autoCapitalize="none"
                      style={{
                        height: 44,
                        marginTop: 0,
                        marginBottom: 0,
                        justifyContent: "center",
                      }}
                      inputStyle={{
                        paddingVertical: 0,
                        height: "100%",
                        textAlignVertical: "center",
                      }}
                    />
                  </View>
                  <GlassButton
                    onPress={() => {
                      if (newHandle) {
                        playHapticClick();
                        addAccount(newHandle);
                      }
                    }}
                    style={[
                      styles.miniBtn,
                      { height: 44, marginTop: 0, marginBottom: 0 },
                    ]}
                  >
                    {t.add || "Add"}
                  </GlassButton>
                </View>
              </GlassBox>

              <GlassBox style={styles.suggestionCard}>
                <View style={{ padding: 16, paddingBottom: 10 }}>
                  <Text style={styles.cardTitle}>
                    {t.suggested || "Suggested"}
                  </Text>
                  <SegmentedControl
                    options={["CRYPTO", "STOCKS", "FOREX"]}
                    selected={suggestionCategory}
                    onChange={(val) => {
                      playHapticClick();
                      setSuggestionCategory(val as any);
                    }}
                  />
                </View>

                <View style={{ maxHeight: 300 }}>
                  <ScrollView
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {SUGGESTIONS[suggestionCategory].map((sugg, index) => {
                      const isAdded = trackedAccounts.some(
                        (a) =>
                          a.handle.toLowerCase() === sugg.handle.toLowerCase(),
                      );
                      const isLast =
                        index === SUGGESTIONS[suggestionCategory].length - 1;
                      return (
                        <View
                          key={sugg.handle}
                          style={[
                            styles.suggestionItem,
                            isLast && { borderBottomWidth: 0 },
                          ]}
                        >
                          <View style={styles.userInfo}>
                            <Image
                              source={{
                                uri: `https://unavatar.io/twitter/${sugg.handle}`,
                              }}
                              style={styles.avatarSmall}
                            />
                            <View>
                              <Text style={styles.userNameSmall}>
                                {sugg.name}
                              </Text>
                              <Text style={styles.userHandleSmall}>
                                @{sugg.handle}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              playHapticClick();
                              addAccount(sugg.handle, sugg.name);
                            }}
                            disabled={isAdded}
                            style={[
                              styles.suggestionBtn,
                              isAdded && styles.suggestionBtnDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.suggestionBtnText,
                                isAdded && { color: "rgba(255,255,255,0.3)" },
                              ]}
                            >
                              {isAdded
                                ? t.added || "Added"
                                : `+ ${t.add || "Add"}`}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </GlassBox>
            </View>
          )}

          <View style={{ marginBottom: 15, marginTop: 10 }}>
            <View style={styles.statusRow}>
              <Text style={styles.sectionLabel}>
                {t.active_watchlist || "ACTIVE WATCHLIST"}
              </Text>

              {subscriptionTier !== SubscriptionTier.FREE ? (
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>
                    {t.monitoring_live || "Monitoring Live"}
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.statusPill,
                    {
                      borderColor: "rgba(255,255,255,0.1)",
                      backgroundColor: "transparent",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: "gray", shadowOpacity: 0 },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: "gray" }]}>
                    Auto-Scan Off
                  </Text>
                </View>
              )}
            </View>
          </View>

          {!isAdding && trackedAccounts.length === 0 && (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyTitle}>
                {t.no_accounts || "No accounts tracked"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t.tap_add || "Tap + to add influencers"}
              </Text>
            </View>
          )}

          <View style={styles.accountList}>
            {activeTrackers.map((acc) => (
              <GlassBox key={acc.id} style={styles.accountCard}>
                <View style={styles.accountContent}>
                  <View>
                    <Image
                      source={{ uri: acc.avatarUrl }}
                      style={styles.avatar}
                    />
                    {isScanning === acc.id && (
                      <View style={styles.processingOverlay}>
                        <ActivityIndicator size="small" color="#0A84FF" />
                      </View>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {acc.name}
                    </Text>
                    <Text style={styles.userHandle}>@{acc.handle}</Text>
                  </View>
                  <View style={styles.actions}>
                    {/* MANUAL SCAN BUTTON */}
                    <GlassButton
                      variant="secondary"
                      disabled={!!isScanning}
                      onPress={async () => {
                        if (!user) return;

                        const userSnap = await firestore()
                          .collection("users")
                          .doc(user.uid)
                          .get();

                        const userData = userSnap.data() || {};

                        const realProfile: UserProfile = {
                          uid: user.uid,
                          email: user.email || "",
                          tier:
                            (userData?.tier as SubscriptionTier) ||
                            SubscriptionTier.FREE,
                          credits: userData?.credits || 0,
                          name: user.displayName || "User",
                          avatarUrl: "",
                          usage: userData?.usage || {
                            scansToday: 0,
                            analysesToday: 0,
                            trackersCount: trackedAccounts.length,
                            totalLifetimeScans: 0,
                            totalLifetimeAnalyses: 0,
                            totalLifetimeTrackers: 0,
                          },
                        };

                        const canScan = checkUsageLimit(
                          realProfile,
                          "manualScans",
                          () => router.push("/(tabs)/profile"),
                        );
                        if (!canScan) return;
                        playScanStart();
                        await scanAccount(acc);
                        await incrementUsage(user.uid, "manualScans");
                      }}
                      style={styles.scanBtn}
                    >
                      <Text style={styles.scanBtnText}>
                        {t.scan_btn || "Scan"}
                      </Text>
                    </GlassButton>

                    <TouchableOpacity
                      onPress={() => {
                        playHapticClick();
                        performRemoveAccount(acc.id, acc.handle);
                      }}
                      style={styles.removeBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="rgba(255,255,255,0.4)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassBox>
            ))}

            {lockedTrackers.map((acc) => (
              <TouchableOpacity
                key={acc.id}
                activeOpacity={0.9}
                onPress={() => {
                  playHapticClick();
                  router.push("/(tabs)/profile");
                }}
              >
                <GlassBox
                  style={[
                    styles.accountCard,
                    { opacity: 0.5, overflow: "hidden" },
                  ]}
                >
                  <View style={[styles.accountContent, { opacity: 0.3 }]}>
                    <Image
                      source={{ uri: acc.avatarUrl }}
                      style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {acc.name}
                      </Text>
                      <Text style={styles.userHandle}>@{acc.handle}</Text>
                    </View>
                    <View style={styles.actions}>
                      <View style={styles.scanBtn}>
                        <Text style={styles.scanBtnText}>Scan</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.lockedOverlay}>
                    <View style={styles.lockIconCircle}>
                      <Ionicons name="lock-closed" size={20} color="#fff" />
                    </View>
                    <Text style={styles.lockedText}>Upgrade to Unlock</Text>
                    <TouchableOpacity
                      onPress={() => {
                        playHapticClick();
                        Alert.alert(
                          "Remove Account?",
                          "Do you want to remove this locked account to free up space?",
                          [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Remove",
                              style: "destructive",
                              onPress: () =>
                                performRemoveAccount(acc.id, acc.handle),
                            },
                          ],
                        );
                      }}
                      style={styles.lockedDeleteBtn}
                    >
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.6)",
                          fontSize: 10,
                          textDecorationLine: "underline",
                        }}
                      >
                        Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                </GlassBox>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
    fontWeight: "500",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(10, 132, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(10, 132, 255, 0.3)",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 200, 80, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(40, 200, 80, 0.15)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#30D158",
    marginRight: 6,
    shadowColor: "#30D158",
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  statusText: { color: "#30D158", fontSize: 11, fontWeight: "600" },
  scrollContent: { flexGrow: 1, paddingBottom: 120, paddingHorizontal: 16 },
  accountList: { gap: 10 },
  accountCard: {
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
  },
  accountContent: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 2 },
  userHandle: { fontSize: 13, color: "rgba(255,255,255,0.4)" },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  scanBtn: {
    height: 34,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 17,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  scanBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  removeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  suggestionCard: {
    padding: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    height: 44,
  },
  miniBtn: {
    width: 65,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
  },
  suggestionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#333",
  },
  userNameSmall: { fontSize: 14, fontWeight: "600", color: "#fff" },
  userHandleSmall: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  suggestionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(10,132,255,0.1)",
    borderRadius: 8,
  },
  suggestionBtnDisabled: { backgroundColor: "rgba(255,255,255,0.05)" },
  suggestionBtnText: { fontSize: 12, color: "#0A84FF", fontWeight: "bold" },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubtitle: { fontSize: 15, color: "rgba(255,255,255,0.4)" },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  lockIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: "#0A84FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 4,
    shadowColor: "#0A84FF",
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  lockedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 10,
  },
  lockedDeleteBtn: {
    padding: 5,
    paddingTop: 2,
  },
});