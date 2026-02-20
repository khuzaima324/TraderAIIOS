import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import firestore from "@react-native-firebase/firestore";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { analyzeChartImage } from "../services/geminiService";
import { addToHistory } from "../services/history";
import { translations } from "../services/translations";
import { checkUsageLimit, incrementUsage } from "../services/usageService";
import {
  HistoryItem,
  LanguageCode,
  SubscriptionTier,
  TradeResult,
  TradeSetup,
  UserProfile,
} from "../types";
import {
  Badge,
  GlassBox,
  GlassButton,
  GlassCard,
  NotificationModal,
} from "./GlassComponents";

const { width } = Dimensions.get("window");

interface AnalyzerProps {
  onSaveTrade: (item: HistoryItem) => void;
  userTier: SubscriptionTier;
  language: LanguageCode;
  checkLimit?: () => Promise<boolean>;
}

export const Analyzer: React.FC<AnalyzerProps> = ({
  onSaveTrade,
  userTier,
  language,
  checkLimit,
}) => {
  const router = useRouter();
  const t = translations[language] || translations["en"];
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TradeSetup | null>(null);
  const [isTradeSaved, setIsTradeSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { user } = useAuth();

  const pickImage = async (useCamera: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Sorry, we need camera permissions!");
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Sorry, we need gallery permissions!");
        return;
      }
    }

    try {
      const pickerOptions: ImagePicker.ImagePickerOptions = {
        // 🛠️ FIX: Change ['images'] to ImagePicker.MediaTypeOptions.Images
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      };

      const pickerResult = await (useCamera
        ? ImagePicker.launchCameraAsync(pickerOptions)
        : ImagePicker.launchImageLibraryAsync(pickerOptions));

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0].base64) {
        setImage(`data:image/jpeg;base64,${pickerResult.assets[0].base64}`);
        resetState();
      }
    } catch (error) {
      console.error("Picker Error:", error);
    }
  };

  const resetState = () => {
    setResult(null);
    setIsTradeSaved(false);
    setErrorMsg(null);
    setShowAdvanced(false);
  };

  const clear = () => {
    setImage(null);
    resetState();
  };

  const handleAnalyze = async () => {
    if (!image) return;

    if (!user) {
      Alert.alert(t.error, "Please log in to analyze charts.");
      return;
    }

    try {
      const userSnap = await firestore()
        .collection("users")
        .doc(user.uid)
        .get();
      const userData = userSnap.data() || {};

      const realProfile: UserProfile = {
        uid: user.uid,
        email: user.email || "",
        tier: (userData?.tier as SubscriptionTier) || "FREE",
        credits: userData?.credits || 0,
        name: user.displayName || "User",
        avatarUrl: "",
        usage: userData?.usage || {
          scansToday: 0,
          analysesToday: 0,
          trackersCount: 0,
          totalLifetimeScans: 0,
          totalLifetimeAnalyses: 0,
          totalLifetimeTrackers: 0,
        },
      };

      const canAnalyze = checkUsageLimit(realProfile, "chartAnalysis", () => {
        router.push("/profile");
      });
      if (!canAnalyze) return;

      setIsAnalyzing(true);
      setErrorMsg(null);

      const base64Data = image.split(",")[1];
      const setup = await analyzeChartImage(base64Data, language);

      if (setup.isChart === false) {
        setErrorMsg("This image does not appear to be a trading chart.");
        setResult(null);
        setIsAnalyzing(false);
        return;
      }

      setResult(setup);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await incrementUsage(user.uid, "chartAnalysis");
    } catch (error) {
      console.error(error);
      setErrorMsg("Failed to analyze chart. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlaceTrade = async () => {
    if (!result || !image || isTradeSaved || !user) return;

    try {
      await addToHistory(user.uid, {
        // id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type: "SCREENSHOT",
        setup: result,
        sourceImage: image,
        result: TradeResult.PENDING,
      });

      setIsTradeSaved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setTimeout(() => {
        clear();
      }, 1500);
    } catch (error) {
      console.error("Error saving trade:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>
            {t.analyzer_title || "Analyzer"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t.scan_charts || "AI Chart Analysis"}
          </Text>
        </View>

        {image && !isAnalyzing && (
          <TouchableOpacity onPress={clear}>
            <Text style={styles.clearBtn}>{t.new_scan || "New Scan"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {errorMsg && (
        <NotificationModal
          message={errorMsg}
          type="error"
          visible={!!errorMsg}
          onClose={() => setErrorMsg(null)}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!image && (
          <View style={styles.emptyContainer}>
            <GlassCard style={styles.stepsCard}>
              <Text style={styles.stepsHeader}>{t.how_it_works}</Text>
              <View style={styles.stepRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNum}>1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{t.step_1_title}</Text>
                  <Text style={styles.stepDesc}>{t.step_1_desc}</Text>
                </View>
              </View>
              <View style={styles.stepRow}>
                <View
                  style={[
                    styles.stepBadge,
                    {
                      borderColor: "#AF52DE",
                      backgroundColor: "rgba(175,82,222,0.1)",
                    },
                  ]}
                >
                  <Text style={[styles.stepNum, { color: "#AF52DE" }]}>2</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{t.step_2_title}</Text>
                  <Text style={styles.stepDesc}>{t.step_2_desc}</Text>
                </View>
              </View>
              <View style={styles.stepRow}>
                <View
                  style={[
                    styles.stepBadge,
                    {
                      borderColor: "#30D158",
                      backgroundColor: "rgba(48,209,88,0.1)",
                    },
                  ]}
                >
                  <Text style={[styles.stepNum, { color: "#30D158" }]}>3</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{t.step_3_title}</Text>
                  <Text style={styles.stepDesc}>{t.step_3_desc}</Text>
                </View>
              </View>
            </GlassCard>

            <View style={styles.actionGrid}>
              <TouchableOpacity
                onPress={() => pickImage(false)}
                style={styles.actionBtn}
              >
                <View style={styles.actionIconCircle}>
                  <Ionicons name="images" size={24} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>{t.upload_image}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => pickImage(true)}
                style={styles.actionBtn}
              >
                <View style={styles.actionIconCircle}>
                  <Ionicons name="camera" size={24} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>{t.take_photo}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {image && (
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: image }}
                style={[styles.previewImage, isAnalyzing && { opacity: 0.5 }]}
                resizeMode="contain"
              />

              {isAnalyzing && (
                <View style={styles.scanningOverlay}>
                  <ActivityIndicator size="large" color="#0A84FF" />
                  <Text style={styles.analyzingText}>
                    {t.advanced_analysis}...
                  </Text>
                </View>
              )}
            </View>

            {!result && !isAnalyzing && (
              <GlassButton
                onPress={handleAnalyze}
                style={{ marginTop: 20 }}
                variant="primary"
              >
                {t.analyze_chart}
              </GlassButton>
            )}
          </View>
        )}

        {result && (
          <View style={{ paddingBottom: 40 }}>
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultHeaderStrip}>
                <Text style={styles.potentialText}>{t.potential_setup}</Text>
              </View>

              <View style={styles.resultMain}>
                <View>
                  <Text style={styles.assetLabel}>{result.asset}</Text>
                  <Text style={styles.symbolLabel}>{result.symbol}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Badge color={result.direction === "LONG" ? "green" : "red"}>
                    {result.direction}
                  </Badge>
                  <Text style={styles.confText}>
                    Conf: {result.confidence ? result.confidence : "0"}%
                  </Text>
                </View>
              </View>

              <View style={styles.resultGrid}>
                <View style={styles.gridItem}>
                  <Text style={styles.gridLabel}>{t.entry}</Text>
                  <Text style={styles.gridValue}>{result.entryPrice}</Text>
                </View>
                <View
                  style={[
                    styles.gridItem,
                    {
                      borderLeftWidth: 1,
                      borderRightWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)",
                    },
                  ]}
                >
                  <Text style={[styles.gridLabel, { color: "#FF453A" }]}>
                    {t.stop_loss}
                  </Text>
                  <Text style={[styles.gridValue, { color: "#FF453A" }]}>
                    {result.stopLoss}
                  </Text>
                </View>
                <View style={styles.gridItem}>
                  <Text style={[styles.gridLabel, { color: "#30D158" }]}>
                    {t.target_1}
                  </Text>
                  <Text style={[styles.gridValue, { color: "#30D158" }]}>
                    {result.takeProfit}
                  </Text>
                </View>
              </View>

              <View style={styles.resultFooter}>
                {(result.takeProfit2 || result.takeProfit3) && (
                  <View style={styles.extendedContainer}>
                    <Text style={styles.subHeader}>{t.extended_targets}</Text>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                      {result.takeProfit2 && (
                        <View style={styles.tpBox}>
                          <Text style={styles.tpLabel}>TP2</Text>
                          <Text style={styles.tpValue}>
                            {result.takeProfit2}
                          </Text>
                        </View>
                      )}
                      {result.takeProfit3 && (
                        <View style={styles.tpBox}>
                          <Text style={styles.tpLabel}>TP3</Text>
                          <Text style={styles.tpValue}>
                            {result.takeProfit3}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.reasoningBox}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 5,
                    }}
                  >
                    <Text style={styles.subHeader}>{t.risk_reward}</Text>
                    <Text style={[styles.subHeader, { color: "#0A84FF" }]}>
                      {result.riskRewardRatio}
                    </Text>
                  </View>
                  <Text style={styles.subHeader}>{t.analyst_summary}</Text>
                  <Text style={styles.reasoningText}>{result.reasoning}</Text>
                </View>
              </View>
            </GlassCard>

            {userTier !== "FREE" && result?.advanced && (
              <GlassBox style={styles.advancedCard}>
                <TouchableOpacity
                  onPress={() => {
                    try {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut,
                      );
                    } catch (e) {}
                    setShowAdvanced(!showAdvanced);
                  }}
                  style={styles.advancedHeader}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Ionicons name="analytics" size={20} color="#BF5AF2" />
                    <Text style={styles.advancedTitle}>
                      {t.inst_analysis_btn || "Institutional Analysis"}
                    </Text>
                  </View>
                  <Ionicons
                    name={showAdvanced ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>

                {showAdvanced && (
                  <View style={styles.advancedBody}>
                    <View style={styles.structureBox}>
                      <Text style={styles.subHeader}>
                        {t.market_structure || "Market Structure"}
                      </Text>
                      <Text style={styles.trendText}>
                        {result.advanced?.marketStructure?.trend || "Neutral"}
                      </Text>
                      <Text style={styles.structureType}>
                        {result.advanced?.marketStructure?.structureType ||
                          "Consolidation"}
                      </Text>
                    </View>

                    <View style={{ marginVertical: 10 }}>
                      <Text style={styles.subHeader}>
                        {t.patterns_detected || "Patterns"}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 5,
                          marginTop: 5,
                        }}
                      >
                        {[
                          ...(result.advanced?.patterns?.candlePatterns || []),
                          ...(result.advanced?.patterns?.chartPatterns || []),
                        ].length > 0 ? (
                          [
                            ...(result.advanced?.patterns?.candlePatterns ||
                              []),
                            ...(result.advanced?.patterns?.chartPatterns || []),
                          ].map((p, i) => (
                            <Badge key={i} color="blue">
                              {p}
                            </Badge>
                          ))
                        ) : (
                          <Text style={{ color: "gray", fontSize: 12 }}>
                            None detected
                          </Text>
                        )}
                      </View>
                    </View>

                    {userTier === "PRO" ? (
                      <>
                        <View
                          style={{
                            marginTop: 15,
                            paddingTop: 15,
                            borderTopWidth: 1,
                            borderTopColor: "rgba(255,255,255,0.05)",
                          }}
                        >
                          <Text style={styles.subHeader}>
                            {t.inst_zones || "Institutional Zones"}
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              gap: 10,
                              marginTop: 5,
                            }}
                          >
                            <View style={styles.zoneBox}>
                              <Text style={styles.zoneLabel}>FVG</Text>
                              <Text style={styles.zoneValue}>
                                {result.advanced?.keyLevels?.fairValueGaps?.join(
                                  ", ",
                                ) || "None"}
                              </Text>
                            </View>
                            <View style={styles.zoneBox}>
                              <Text style={styles.zoneLabel}>Order Blocks</Text>
                              <Text style={styles.zoneValue}>
                                {result.advanced?.keyLevels?.orderBlocks?.join(
                                  ", ",
                                ) || "None"}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={{ marginTop: 15 }}>
                          <Text style={styles.subHeader}>Strategy Bias</Text>
                          <View style={styles.strategyBox}>
                            <Ionicons name="flash" size={16} color="#0A84FF" />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.strategyTitle}>
                                {result.advanced?.strategy?.suggestedType}
                              </Text>
                              <Text style={styles.strategyDesc}>
                                {result.advanced?.strategy?.warning}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </>
                    ) : (
                      <View style={styles.lockedContainer}>
                        <View style={styles.lockedBlur} />
                        <View style={styles.lockedContent}>
                          <Ionicons
                            name="lock-closed"
                            size={24}
                            color="rgba(255,255,255,0.4)"
                          />
                          <Text style={styles.lockedTitle}>
                            {t.unlock_deep || "Unlock Deep Insights"}
                          </Text>
                          <Text style={styles.lockedDesc}>
                            {t.unlock_desc ||
                              "Liquidity Heatmaps, Institutional Zones & Strategy..."}
                          </Text>
                          <Badge color="blue" style={{ marginTop: 8 }}>
                            {t.pro_feature || "PRO FEATURE"}
                          </Badge>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </GlassBox>
            )}

            {userTier !== "PRO" && (
              <GlassCard style={styles.upgradeCard}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 15,
                  }}
                >
                  <View style={styles.upgradeIcon}>
                    <Ionicons name="rocket" size={20} color="#30D158" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.upgradeTitle}>
                      {userTier === "FREE"
                        ? t.unlock_full || "Unlock Full Power"
                        : t.unlock_deep || "Unlock Deep Insights"}
                    </Text>
                    <Text style={styles.upgradeDesc}>
                      {userTier === "FREE"
                        ? t.upgrade_hint_free
                        : t.upgrade_hint_plus}
                    </Text>
                  </View>
                </View>
                <Badge
                  color="green"
                  style={{ alignSelf: "flex-start", marginTop: 10 }}
                >
                  {t.upgrade || "Upgrade"}
                </Badge>
              </GlassCard>
            )}

            <View style={styles.actionRow}>
              <GlassButton
                variant="secondary"
                onPress={clear}
                style={{ flex: 1 }}
              >
                {t.new_scan}
              </GlassButton>
              <GlassButton
                variant={isTradeSaved ? "success" : "primary"}
                onPress={handlePlaceTrade}
                style={{ flex: 1 }}
                disabled={isTradeSaved}
              >
                {isTradeSaved ? t.saved : t.place_trade}
              </GlassButton>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 150 },

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
  clearBtn: { color: "#FF453A", fontSize: 14, fontWeight: "600" },

  emptyContainer: { marginTop: 20 },
  stepsCard: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  stepsHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginBottom: 15,
    letterSpacing: 1,
  },
  stepRow: { flexDirection: "row", marginBottom: 12, gap: 12 },
  stepBadge: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: "rgba(10,132,255,0.1)",
    borderColor: "rgba(10,132,255,0.3)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { fontSize: 10, fontWeight: "bold", color: "#0A84FF" },
  stepTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  stepDesc: { color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 16 },

  actionGrid: { flexDirection: "row", gap: 15 },
  actionBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  actionIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  actionLabel: { color: "#fff", fontWeight: "600", fontSize: 12 },

  imageContainer: { marginTop: 10 },
  imageWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  previewImage: { width: "100%", height: "100%" },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  analyzingText: {
    color: "#0A84FF",
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },

  resultCard: { padding: 0, overflow: "hidden", marginTop: 20 },
  resultHeaderStrip: {
    backgroundColor: "rgba(10,132,255,0.1)",
    paddingVertical: 6,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  potentialText: {
    color: "#0A84FF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  resultMain: {
    padding: 20,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  assetLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
  },
  symbolLabel: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  confText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  resultGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  gridItem: { flex: 1, padding: 15, alignItems: "center" },
  gridLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  gridValue: { fontSize: 14, fontWeight: "bold", color: "#fff" },

  resultFooter: { padding: 20 },
  subHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    marginBottom: 8,
  },

  extendedContainer: { marginBottom: 20 },
  tpBox: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tpLabel: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  tpValue: { fontSize: 14, fontWeight: "bold", color: "#30D158" },

  reasoningBox: { paddingTop: 10 },
  reasoningText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },

  advancedCard: {
    padding: 8,
    overflow: "hidden",
    marginBottom: 20,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  advancedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  advancedTitle: { fontWeight: "bold", color: "#fff", fontSize: 14 },
  advancedBody: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  structureBox: { marginBottom: 10 },
  trendText: { fontSize: 28, fontWeight: "300", color: "#fff" },
  structureType: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 },

  // NEW STYLES FOR LOCKING
  lockedContainer: {
    marginTop: 15,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  lockedBlur: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  lockedContent: {
    alignItems: "center",
    gap: 5,
  },
  lockedTitle: {
    color: "#fff",
    fontWeight: "bold",
    marginTop: 5,
    fontSize: 14,
  },
  lockedDesc: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 10,
    textAlign: "center",
    maxWidth: 200,
  },
  zoneBox: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  zoneLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 },
  zoneValue: { fontSize: 12, color: "#fff", fontWeight: "600" },

  strategyBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "rgba(10,132,255,0.1)",
    borderColor: "rgba(10,132,255,0.2)",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  strategyTextArea: {
    flex: 1,
  },
  strategyTitle: { fontSize: 12, fontWeight: "bold", color: "#0A84FF" },
  strategyDesc: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    flexWrap: "wrap",
  },
  upgradeCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(48,209,88,0.2)",
    backgroundColor: "rgba(48,209,88,0.05)",
    marginBottom: 20,
  },
  upgradeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(48,209,88,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeTitle: { fontSize: 14, fontWeight: "bold", color: "#fff" },
  upgradeDesc: { fontSize: 10, color: "rgba(255,255,255,0.5)" },

  actionRow: { flexDirection: "row", gap: 15, marginTop: 10 },
});