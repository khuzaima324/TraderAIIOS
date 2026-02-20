import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  InteractionManager,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { playHapticClick, playSuccessSound } from "../services/soundService";
import { translations } from "../services/translations";
import {
  HistoryItem,
  LanguageCode,
  SignalFeedItem,
  TradeResult,
} from "../types";

const { height } = Dimensions.get("window");

const COLORS = {
  bg: "#000000",
  cardBg: "rgba(255,255,255,0.03)",
  modalBg: "#1C1C1E",
  neonBlue: "#0A84FF",
  neonGreen: "#30D158",
  neonRed: "#FF453A",
  border: "rgba(255,255,255,0.1)",
  textMain: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.4)",
};

interface SignalsFeedProps {
  signals: SignalFeedItem[];
  onRemoveSignal: (id: string) => void;
  onSaveTrade: (item: HistoryItem) => void;
  language: LanguageCode;
}

export const SignalsFeed: React.FC<SignalsFeedProps> = ({
  signals,
  onRemoveSignal,
  onSaveTrade,
  language,
}) => {
  const t = translations[language] || translations["en"];
  const [selectedSignal, setSelectedSignal] = useState<SignalFeedItem | null>(
    null,
  );
  const [isReady, setIsReady] = useState(false);

  const isValidValue = (val: string | null | undefined) => {
    if (!val) return false;
    const invalidStrings = [
      "N/A",
      "n/a",
      "null",
      "Market",
      "Dynamic",
      "0",
      "See Chart",
    ];
    return !invalidStrings.includes(val.trim());
  };

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

  // const getTimeAgo = (timestamp: number) => {
  //   const seconds = Math.floor((Date.now() - timestamp) / 1000);
  //   if (seconds < 60) return "Just now";
  //   const minutes = Math.floor(seconds / 60);
  //   if (minutes < 60) return `${minutes}m ago`;
  //   const hours = Math.floor(minutes / 60);
  //   if (hours < 24) return `${hours}h ago`;
  //   return `${Math.floor(hours / 24)}d ago`;
  // };

  const getTimeAgo = (timestamp: number) => {
    // Fix: Check if timestamp is valid before doing math
    if (!timestamp || isNaN(timestamp)) return "Recently";

    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handlePlaceOrder = () => {
    if (!selectedSignal) return;
    playSuccessSound();

    const historyItem: any = {
      timestamp: Date.now(),
      type: "TWEET",
      sourceText: selectedSignal.tweet,
      sourceImage: `https://unavatar.io/twitter/${selectedSignal.handle}`,
      setup: selectedSignal.setup,
      result: TradeResult.PENDING,
    };

    onSaveTrade(historyItem);
    onRemoveSignal(selectedSignal.id);
    setSelectedSignal(null);
  };

  const handleIgnore = () => {
    if (selectedSignal) {
      playHapticClick();
      onRemoveSignal(selectedSignal.id);
      setSelectedSignal(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>{t.signals_title || "Signals"}</Text>
          <Text style={styles.headerSubtitle}>
            {t.ai_alerts || "AI Opportunities"}
          </Text>
        </View>
      </View>

      {!isReady ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.neonBlue} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {signals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {t.no_signals || "No Signals"}
              </Text>
              <Text style={styles.emptySub}>
                {t.scan_to_find || "Scan accounts to find setups"}
              </Text>
            </View>
          ) : (
            signals
              .slice()
              .sort((a, b) => b.tweetTimestamp - a.tweetTimestamp)
              .map((signal) => (
                <TouchableOpacity
                  key={signal.id}
                  style={styles.signalCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    playHapticClick();
                    setSelectedSignal(signal);
                  }}
                >
                  <View style={styles.avatarSection}>
                    <Image
                      source={{
                        uri: `https://unavatar.io/twitter/${signal.handle}`,
                      }}
                      style={styles.avatar}
                    />
                    <View style={styles.platformBadge}>
                      <View style={styles.platformBadgeInner}>
                        <Ionicons name="logo-twitter" size={8} color="#fff" />
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.handleText}>{signal.handle}</Text>
                        <Text style={styles.timeText}>
                          {getTimeAgo(signal.tweetTimestamp)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.miniBadge,
                          signal.setup.direction === "LONG"
                            ? styles.badgeGreen
                            : styles.badgeRed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniBadgeText,
                            signal.setup.direction === "LONG"
                              ? styles.textGreen
                              : styles.textRed,
                          ]}
                        >
                          {signal.setup.symbol} {signal.setup.direction}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.tweetText} numberOfLines={2}>
                      "{signal.tweet}"
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={!!selectedSignal}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedSignal(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedSignal && (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <View style={styles.potentialPill}>
                    <Text style={styles.potentialText}>
                      {t.potential_setup || "Potential Setup"}
                    </Text>
                  </View>

                  <View style={styles.titleRow}>
                    <Text style={styles.modalSymbol}>
                      {selectedSignal.setup.symbol}
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        selectedSignal.setup.direction === "LONG"
                          ? styles.badgeGreen
                          : styles.badgeRed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          selectedSignal.setup.direction === "LONG"
                            ? styles.textGreen
                            : styles.textRed,
                        ]}
                      >
                        {selectedSignal.setup.direction}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      {t.triggered_by || "Triggered By"} @
                      {selectedSignal.handle}
                    </Text>
                    <View style={styles.metaDot} />
                    <Text style={[styles.metaText, { color: COLORS.neonBlue }]}>
                      {getTimeAgo(selectedSignal.tweetTimestamp)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    playHapticClick();
                    setSelectedSignal(null);
                  }}
                  style={styles.closeBtn}
                >
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.quoteBox}>
                  <Text style={styles.quoteText}>"{selectedSignal.tweet}"</Text>
                </View>

                <View style={styles.gridContainer}>
                  <View style={styles.gridRow}>
                    {/* Entry Price */}
                    {isValidValue(selectedSignal.setup.entryPrice) && (
                      <View style={styles.dataBox}>
                        <Text style={styles.dataLabel}>
                          {t.entry || "Entry"}
                        </Text>
                        <Text style={styles.dataValue}>
                          {selectedSignal.setup.entryPrice}
                        </Text>
                      </View>
                    )}

                    {/* Stop Loss */}
                    {isValidValue(selectedSignal.setup.stopLoss) && (
                      <View style={[styles.dataBox, styles.borderRed]}>
                        <Text
                          style={[styles.dataLabel, { color: COLORS.neonRed }]}
                        >
                          {t.stop_loss || "Stop Loss"}
                        </Text>
                        <Text
                          style={[styles.dataValue, { color: COLORS.neonRed }]}
                        >
                          {selectedSignal.setup.stopLoss}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.gridRow}>
                    {/* Target 1 */}
                    {isValidValue(selectedSignal.setup.takeProfit) && (
                      <View style={[styles.dataBox, styles.bgGreen]}>
                        <Text
                          style={[
                            styles.dataLabel,
                            { color: COLORS.neonGreen },
                          ]}
                        >
                          {t.target_1 || "Target 1"}
                        </Text>
                        <Text
                          style={[
                            styles.dataValue,
                            { color: COLORS.neonGreen },
                          ]}
                        >
                          {selectedSignal.setup.takeProfit}
                        </Text>
                      </View>
                    )}

                    {/* Target 2 */}
                    {isValidValue(selectedSignal.setup.takeProfit2) && (
                      <View style={[styles.dataBox, styles.bgGreen]}>
                        <Text
                          style={[
                            styles.dataLabel,
                            { color: COLORS.neonGreen },
                          ]}
                        >
                          {t.extended_targets || "Extended"}
                        </Text>
                        <Text
                          style={[
                            styles.dataValue,
                            { color: COLORS.neonGreen },
                          ]}
                        >
                          {selectedSignal.setup.takeProfit2}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {/* <View style={styles.gridContainer}>
                  <View style={styles.gridRow}>
                    <View style={styles.dataBox}>
                      <Text style={styles.dataLabel}>{t.entry || "Entry"}</Text>
                      <Text style={styles.dataValue}>
                        {selectedSignal.setup.entryPrice}
                      </Text>
                    </View>
                    <View style={[styles.dataBox, styles.borderRed]}>
                      <Text
                        style={[styles.dataLabel, { color: COLORS.neonRed }]}
                      >
                        {t.stop_loss || "Stop Loss"}
                      </Text>
                      <Text
                        style={[styles.dataValue, { color: COLORS.neonRed }]}
                      >
                        {selectedSignal.setup.stopLoss}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={[styles.dataBox, styles.bgGreen]}>
                      <Text
                        style={[styles.dataLabel, { color: COLORS.neonGreen }]}
                      >
                        {t.target_1 || "Target 1"}
                      </Text>
                      <Text
                        style={[styles.dataValue, { color: COLORS.neonGreen }]}
                      >
                        {selectedSignal.setup.takeProfit}
                      </Text>
                    </View>
                    {selectedSignal.setup.takeProfit2 && (
                      <View style={[styles.dataBox, styles.bgGreen]}>
                        <Text
                          style={[
                            styles.dataLabel,
                            { color: COLORS.neonGreen },
                          ]}
                        >
                          {t.extended_targets || "Extended"}
                        </Text>
                        <Text
                          style={[
                            styles.dataValue,
                            { color: COLORS.neonGreen },
                          ]}
                        >
                          {selectedSignal.setup.takeProfit2}
                        </Text>
                      </View>
                    )}
                  </View>
                </View> */}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.btnGhost}
                  onPress={handleIgnore}
                >
                  <Text style={styles.btnGhostText}>
                    {t.ignore || "Ignore"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={handlePlaceOrder}
                >
                  <Text style={styles.btnPrimaryText}>
                    {t.place_order || "Place Order"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 150 },

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

  emptyState: {
    padding: 40,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    borderStyle: "dashed",
    alignItems: "center",
    marginTop: 20,
  },
  emptyTitle: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
  },
  emptySub: { color: "rgba(255,255,255,0.2)", fontSize: 12, marginTop: 4 },

  signalCard: {
    flexDirection: "row",
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingVertical: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  avatarSection: { position: "relative", height: "auto" },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  platformBadge: {
    position: "absolute",
    bottom: 18,
    right: -2,
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 2,
  },
  platformBadgeInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.neonBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  handleText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  timeText: { color: COLORS.textMuted, fontSize: 12 },

  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  miniBadgeText: { fontSize: 10, fontWeight: "700" },
  tweetText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    lineHeight: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 18,
  },
  modalContent: {
    backgroundColor: "rgba(28, 28, 30, 0.85)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    maxHeight: height * 0.85,
    width: "100%",
  },

  modalHeader: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(10,132,255,0.02)",
  },
  potentialPill: {
    backgroundColor: "rgba(10,132,255,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  potentialText: {
    color: COLORS.neonBlue,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  modalSymbol: {
    fontSize: 28,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },

  badgeGreen: {
    backgroundColor: "rgba(48,209,88,0.1)",
    borderColor: "rgba(48,209,88,0.2)",
  },
  badgeRed: {
    backgroundColor: "rgba(255,69,58,0.1)",
    borderColor: "rgba(255,69,58,0.2)",
  },
  textGreen: { color: COLORS.neonGreen },
  textRed: { color: COLORS.neonRed },
  bgGreen: {
    backgroundColor: "rgba(48,209,88,0.05)",
    borderColor: "rgba(48,209,88,0.1)",
  },
  borderRed: {
    backgroundColor: "rgba(255,69,58,0.05)",
    borderColor: "rgba(255,69,58,0.1)",
  },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  closeBtn: {
    padding: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
  },

  modalBody: { padding: 16 },
  quoteBox: {
    padding: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    marginBottom: 12,
    borderRadius: 12,
  },
  quoteText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },

  gridContainer: { gap: 12 },
  gridRow: { flexDirection: "row", gap: 12 },
  dataBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: "#333",
  },
  dataLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  dataValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },

  modalFooter: {
    padding: 16,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    gap: 12,
  },
  btnGhost: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: "transparent",
    borderColor: "#252424ff",
    borderWidth: 0.5,
  },
  btnGhostText: { color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  btnPrimary: {
    flex: 1,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: COLORS.neonBlue,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});