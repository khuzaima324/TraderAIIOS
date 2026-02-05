import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { playErrorSound, playHapticClick } from "../services/soundService";
import { translations } from "../services/translations";
import { HistoryItem, LanguageCode } from "../types";
import { GlassBox, SegmentedControl } from "./GlassComponents";

const { height } = Dimensions.get("window");

interface HistoryProps {
  items: HistoryItem[];
  language: LanguageCode;
  onRemoveItem: (id: string) => void;
}

export const History: React.FC<HistoryProps> = ({
  items,
  language,
  onRemoveItem,
}) => {
  const t = translations[language] || translations["en"];
  const [filter, setFilter] = useState<"ALL" | "SCREENSHOT" | "TWEET">("ALL");

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (filter === "ALL") return true;
      return item.type === filter;
    });
    return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
  }, [items, filter]);

  const formatDate = (ts: number) => {
    const locale = language === "en" ? "en-US" : language;
    return new Date(ts).toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const renderTradeItem = ({ item }: { item: HistoryItem }) => {
    const isWin = item.result === "WIN";
    const isLoss = item.result === "LOSS";
    const isPending = item.result === "PENDING";

    const statusColor = isWin ? "#30D158" : isLoss ? "#FF453A" : "#FF9500";
    const statusBg = isWin
      ? "rgba(48,209,88,0.1)"
      : isLoss
        ? "rgba(255,69,58,0.1)"
        : "rgba(255,149,0,0.1)";
    const statusBorder = isWin
      ? "rgba(48,209,88,0.2)"
      : isLoss
        ? "rgba(255,69,58,0.2)"
        : "rgba(255,149,0,0.2)";
    const statusLabel = isWin ? "WIN" : isLoss ? "LOSS" : "ACTIVE";

    return (
      <GlassBox
        style={[
          styles.cardContainer,
          !isPending && {
            borderColor: isWin ? "rgba(48,209,88,0.2)" : "rgba(255,69,58,0.2)",
          },
        ]}
      >
        <View style={[styles.statusLine, { backgroundColor: statusColor }]} />

        <View style={styles.cardInner}>
          <View style={styles.headerRow}>
            <View style={styles.leftSection}>
              <View
                style={[
                  styles.iconBubble,
                  {
                    backgroundColor: isPending
                      ? "rgba(255,255,255,0.05)"
                      : `${statusColor}15`,
                  },
                ]}
              >
                <Ionicons
                  name={item.type === "TWEET" ? "logo-twitter" : "image"}
                  size={14}
                  color={isPending ? "rgba(255,255,255,0.6)" : statusColor}
                />
              </View>

              <View>
                <View style={styles.titleContainer}>
                  <Text style={styles.assetTitle}>{item.setup.asset}</Text>
                  {isPending && <View style={styles.pulseDot} />}
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text
                    style={[
                      styles.directionText,
                      {
                        color:
                          item.setup.direction === "LONG"
                            ? "#30D158"
                            : "#FF453A",
                      },
                    ]}
                  >
                    {item.setup.direction}
                  </Text>
                  <Text style={styles.dateText}>
                    • {formatDate(item.timestamp)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.rightSection}>
              <View
                style={[
                  styles.resultBadge,
                  { backgroundColor: statusBg, borderColor: statusBorder },
                ]}
              >
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  playErrorSound();
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Warning,
                  );
                  Alert.alert(
                    "Delete Record",
                    "Remove this trade from your history?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => onRemoveItem(item.id),
                      },
                    ],
                  );
                }}
                style={styles.deleteButton}
              >
                <Ionicons
                  name="trash-outline"
                  size={14}
                  color="rgba(255,255,255,0.3)"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dataStrip}>
            <View style={styles.dataPoint}>
              <Text style={styles.dataLabel}>{t.entry || "ENTRY"}</Text>
              <Text style={styles.dataValue}>{item.setup.entryPrice}</Text>
            </View>

            <View style={[styles.dataPoint, { alignItems: "center" }]}>
              <Text style={styles.dataLabel}>{t.target_1 || "TARGET"}</Text>
              <Text style={[styles.dataValue, { color: "#30D158" }]}>
                {item.setup.takeProfit}
              </Text>
            </View>

            <View style={[styles.dataPoint, { alignItems: "flex-end" }]}>
              <Text style={styles.dataLabel}>{t.stop_loss || "STOP"}</Text>
              <Text style={[styles.dataValue, { color: "#FF453A" }]}>
                {item.setup.stopLoss}
              </Text>
            </View>
          </View>
        </View>
      </GlassBox>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>{t.history_title || "History"}</Text>
          <Text style={styles.headerSubtitle}>
            {t.perf_log || "Performance Log"}
          </Text>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <SegmentedControl
          options={["ALL", "SCREENSHOT", "TWEET"]}
          selected={filter}
          onChange={(val) => {
            playHapticClick();
            setFilter(val as any);
          }}
        />
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderTradeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="time-outline"
                size={32}
                color="rgba(255,255,255,0.2)"
              />
            </View>
            <Text style={styles.emptyText}>
              {t.no_trades || "No trades yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

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
  filterWrapper: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 150,
  },

  emptyState: { alignItems: "center", marginTop: 80 },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 16,
    fontWeight: "600",
  },

  cardContainer: {
    marginBottom: 12,
    padding: 4,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statusLine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 2.5,
    zIndex: 10,
  },
  cardInner: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    paddingLeft: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  leftSection: { flexDirection: "row", gap: 12 },
  titleContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  pulseDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#FF9500",
  },
  iconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  assetTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  directionText: { fontSize: 10, fontWeight: "700" },
  dateText: { color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: "600" },

  rightSection: { flexDirection: "row", alignItems: "center", gap: 8 },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: { fontSize: 9, fontWeight: "900", letterSpacing: 0.5 },

  dataStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  dataPoint: { flex: 1 },
  dataLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  dataValue: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
});