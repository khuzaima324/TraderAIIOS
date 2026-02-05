import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  Platform,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { GlassCard, Badge } from "../../components/GlassComponents"; // Use your existing glass components!

// Import your existing logic
import {
  getAppOfferings,
  IAPPackages,
  initializeIAP,
  purchaseSubscription,
  restorePurchases,
} from "../../services/iapService";
import { SubscriptionTier } from "../../types";

export default function PaywallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<IAPPackages | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize RevenueCat
        await initializeIAP("anonymous_user");

        // Fetch Real Offerings from Google/Apple
        const fetchedPackages = await getAppOfferings();
        setPackages(fetchedPackages);
      } catch (e) {
        console.error("Paywall load error:", e);
        Alert.alert("Error", "Could not load subscription packages.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handlePurchase = async (tier: SubscriptionTier, cycle: "MONTHLY" | "YEARLY") => {
    if (loading) return;
    setLoading(true);

    const result = await purchaseSubscription(tier, cycle);

    if (result.success) {
      Alert.alert("Success", "Subscription activated! Welcome to Pro.");
      router.back();
    } else if (result.error) {
      Alert.alert("Purchase Failed", result.error);
    }
    setLoading(false);
  };

  const handleRestore = async () => {
    setLoading(true);
    const { tier } = await restorePurchases();
    setLoading(false);

    if (tier !== SubscriptionTier.FREE) {
      Alert.alert("Restored", "Your purchases have been restored.");
      router.back();
    } else {
      Alert.alert("No Subscription", "No active subscriptions found to restore.");
    }
  };

  const renderPackageCard = (
    pkg: PurchasesPackage | null,
    tier: SubscriptionTier,
    cycle: "MONTHLY" | "YEARLY",
    isBestValue: boolean = false,
  ) => {
    if (!pkg) return null;

    return (
      <TouchableOpacity
        onPress={() => handlePurchase(tier, cycle)}
        activeOpacity={0.8}
        style={{ marginBottom: 12 }}
      >
        <GlassCard style={[styles.card, isBestValue && styles.cardBestValue]}>
          {isBestValue && (
            <View style={styles.bestValueBadge}>
              <Text style={styles.bestValueText}>BEST VALUE</Text>
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{pkg.product.title}</Text>
              <Text style={styles.cardDesc}>{pkg.product.description}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.price}>{pkg.product.priceString}</Text>
              <Text style={styles.period}>/{cycle.toLowerCase()}</Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ADE80" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Access</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.iconCircle}>
            <Ionicons name="diamond" size={40} color="#4ADE80" />
          </View>
          <Text style={styles.heroTitle}>Unlock Traders AI</Text>
          <Text style={styles.heroSubtitle}>
            Unlimited signals, AI predictions, and real-time alerts.
          </Text>
        </View>

        {/* Features List */}
        <GlassCard style={styles.features}>
          <FeatureItem text="Unlimited AI Trading Signals" />
          <FeatureItem text="Advanced Chart Patterns" />
          <FeatureItem text="Ad-Free Experience" />
        </GlassCard>

        {/* PRO TIER */}
        {(packages?.proYearly || packages?.proMonthly) && <Text style={styles.sectionHeader}>Pro Plan</Text>}
        {renderPackageCard(packages?.proYearly || null, SubscriptionTier.PRO, "YEARLY", true)}
        {renderPackageCard(packages?.proMonthly || null, SubscriptionTier.PRO, "MONTHLY")}

        {/* PLUS TIER */}
        {(packages?.plusYearly || packages?.plusMonthly) && <Text style={styles.sectionHeader}>Plus Plan</Text>}
        {renderPackageCard(packages?.plusYearly || null, SubscriptionTier.PLUS, "YEARLY")}
        {renderPackageCard(packages?.plusMonthly || null, SubscriptionTier.PLUS, "MONTHLY")}

        {!packages?.proMonthly && !packages?.plusMonthly && (
          <Text style={styles.errorText}>No subscriptions available at this time.</Text>
        )}

        {/* Legal Footer (Required for Apple Review) */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => Linking.openURL("https://yourwebsite.com/terms")}>
            <Text style={styles.linkText}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.linkDivider}>|</Text>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.linkText}>Restore</Text>
          </TouchableOpacity>
          <Text style={styles.linkDivider}>|</Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://yourwebsite.com/privacy")}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          Payment will be charged to your iTunes account at confirmation of purchase. Subscriptions
          automatically renew unless auto-renew is turned off at least 24-hours before the end of
          the current period.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureItem = ({ text }: { text: string }) => (
  <View style={styles.featureRow}>
    <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  loadingContainer: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  closeButton: { padding: 4 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  hero: { alignItems: "center", marginBottom: 30 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(74, 222, 128, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  heroSubtitle: { color: "#aaa", textAlign: "center", fontSize: 15, marginTop: 8, lineHeight: 22 },
  features: { marginBottom: 30, padding: 15 },
  featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  featureText: { color: "#fff", fontSize: 15, marginLeft: 10 },
  sectionHeader: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: { padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBestValue: { borderColor: "#4ADE80", backgroundColor: "rgba(74, 222, 128, 0.05)" },
  bestValueBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#4ADE80",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
  },
  cardContent: { 
    padding: 20, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  bestValueText: { color: "#000", fontSize: 10, fontWeight: "bold" },
  cardTitle: { color: "#fff", fontSize: 17, fontWeight: "bold" },
  cardDesc: { color: "#aaa", fontSize: 13, marginTop: 2 },
  price: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  period: { color: "#888", fontSize: 12 },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    gap: 10,
  },
  linkText: { color: "#666", fontSize: 12, textDecorationLine: "underline" },
  linkDivider: { color: "#333" },
  disclaimer: { marginTop: 20, color: "#444", fontSize: 10, textAlign: "center", lineHeight: 16 },
  errorText: { color: "#666", textAlign: "center", marginTop: 20 },
});