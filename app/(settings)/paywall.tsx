// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { PurchasesPackage } from "react-native-purchases";

// import {
//   getAppOfferings,
//   IAPPackages,
//   initializeIAP,
//   purchaseSubscription,
//   restorePurchases,
// } from "../../services/iapService";
// import { SubscriptionTier } from "../../types";

// export default function PaywallScreen() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [packages, setPackages] = useState<IAPPackages | null>(null);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         await initializeIAP("anonymous_user");

//         const fetchedPackages = await getAppOfferings();
//         setPackages(fetchedPackages);
//       } catch (e) {
//         console.error("Paywall load error:", e);
//         Alert.alert("Error", "Could not load subscription packages.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const handlePurchase = async (
//     tier: SubscriptionTier,
//     cycle: "MONTHLY" | "YEARLY",
//   ) => {
//     if (loading) return;
//     setLoading(true);

//     const result = await purchaseSubscription(tier, cycle);

//     if (result.success) {
//       Alert.alert("Success", "Subscription activated! Welcome to Pro.");
//       router.back();
//     } else {
//       if (result.actionTaken === "REDIRECT") {
//       } else if (result.error) {
//         Alert.alert("Purchase Failed", result.error);
//       }
//     }
//     setLoading(false);
//   };

//   const handleRestore = async () => {
//     setLoading(true);
//     const { tier } = await restorePurchases();
//     setLoading(false);

//     if (tier !== SubscriptionTier.FREE) {
//       Alert.alert("Restored", "Your purchases have been restored.");
//       router.back();
//     } else {
//       Alert.alert(
//         "No Subscription",
//         "No active subscriptions found to restore.",
//       );
//     }
//   };

//   const renderPackageCard = (
//     pkg: PurchasesPackage | null,
//     tier: SubscriptionTier,
//     cycle: "MONTHLY" | "YEARLY",
//     isBestValue: boolean = false,
//   ) => {
//     if (!pkg) return null;

//     return (
//       <TouchableOpacity
//         style={[styles.card, isBestValue && styles.cardBestValue]}
//         onPress={() => handlePurchase(tier, cycle)}
//         activeOpacity={0.8}
//       >
//         {isBestValue && (
//           <View style={styles.badge}>
//             <Text style={styles.badgeText}>BEST VALUE</Text>
//           </View>
//         )}
//         <View style={styles.cardContent}>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.cardTitle}>{pkg.product.title}</Text>
//             <Text style={styles.cardDesc}>{pkg.product.description}</Text>
//           </View>
//           {/* <View style={{ alignItems: "flex-end" }}>
//             <Text style={styles.price}>{pkg.product.priceString}</Text>
//             <Text style={styles.period}>/{cycle.toLowerCase()}</Text>
//           </View> */}
//           <View style={{ alignItems: "flex-end" }}>
//   <Text style={styles.price}>
//     {pkg.product.priceString}
//     <Text style={styles.periodInline}>
//       {" "} / {cycle === "YEARLY" ? "Year" : "Month"}
//     </Text>
//   </Text>
// </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#4ADE80" />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.closeButton}
//         >
//           <Ionicons name="close" size={28} color="#fff" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Premium Access</Text>
//         <View style={{ width: 28 }} />
//       </View>

//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         {/* Hero Section */}
//         <View style={styles.hero}>
//           <Ionicons name="diamond" size={48} color="#4ADE80" />
//           <Text style={styles.heroTitle}>Unlock Traders AI</Text>
//           <Text style={styles.heroSubtitle}>
//             Unlimited signals, AI predictions, and real-time alerts.
//           </Text>
//         </View>

//         {/* Features List */}
//         <View style={styles.features}>
//           <FeatureItem text="Unlimited AI Trading Signals" />
//           <FeatureItem text="Advanced Chart Patterns" />
//           <FeatureItem text="Ad-Free Experience" />
//         </View>

//         {/* PRO TIER */}
//         {(packages?.proYearly || packages?.proMonthly) && (
//           <Text style={styles.sectionHeader}>Pro Plan</Text>
//         )}
//         {renderPackageCard(
//           packages?.proYearly || null,
//           SubscriptionTier.PRO,
//           "YEARLY",
//           true,
//         )}
//         {renderPackageCard(
//           packages?.proMonthly || null,
//           SubscriptionTier.PRO,
//           "MONTHLY",
//         )}

//         {/* PLUS TIER */}
//         {(packages?.plusYearly || packages?.plusMonthly) && (
//           <Text style={styles.sectionHeader}>Plus Plan</Text>
//         )}
//         {renderPackageCard(
//           packages?.plusYearly || null,
//           SubscriptionTier.PLUS,
//           "YEARLY",
//         )}
//         {renderPackageCard(
//           packages?.plusMonthly || null,
//           SubscriptionTier.PLUS,
//           "MONTHLY",
//         )}

//         {/* Empty State (If no packages found) */}
//         {!packages?.proMonthly && !packages?.plusMonthly && (
//           <Text style={styles.errorText}>
//             No subscriptions available at this time.
//           </Text>
//         )}

//         {/* Footer Actions */}
//         <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
//           <Text style={styles.restoreText}>Restore Purchases</Text>
//         </TouchableOpacity>

//         <Text style={styles.disclaimer}>
//           Recurring billing, cancel anytime via Store settings.
//         </Text>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const FeatureItem = ({ text }: { text: string }) => (
//   <View style={styles.featureRow}>
//     <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
//     <Text style={styles.featureText}>{text}</Text>
//   </View>
// );

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000000" },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: "#000",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 16,
//   },
//   headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
//   closeButton: { padding: 4 },
//   scrollContent: { padding: 20, paddingBottom: 50 },
//   hero: { alignItems: "center", marginBottom: 30 },
//   heroTitle: {
//     color: "#fff",
//     fontSize: 26,
//     fontWeight: "bold",
//     marginTop: 10,
//     marginBottom: 8,
//   },
//   heroSubtitle: {
//     color: "#aaa",
//     textAlign: "center",
//     fontSize: 15,
//     lineHeight: 22,
//   },
//   features: {
//     marginBottom: 30,
//     backgroundColor: "#111",
//     padding: 20,
//     borderRadius: 16,
//   },
//   featureRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
//   featureText: { color: "#fff", fontSize: 15, marginLeft: 10 },
//   sectionHeader: {
//     color: "#888",
//     fontSize: 13,
//     fontWeight: "600",
//     marginBottom: 10,
//     marginTop: 10,
//     textTransform: "uppercase",
//     letterSpacing: 1,
//   },
//   card: {
//     backgroundColor: "#1E1E1E",
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#333",
//     marginBottom: 12,
//     overflow: "hidden",
//   },
//   cardBestValue: { borderColor: "#4ADE80", backgroundColor: "#1a2e21" },
//   badge: {
//     backgroundColor: "#4ADE80",
//     paddingVertical: 4,
//     alignItems: "center",
//   },
//   badgeText: { color: "#000", fontWeight: "bold", fontSize: 11 },
//   cardContent: {
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   cardTitle: {
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "bold",
//     marginBottom: 4,
//   },
//   cardDesc: { color: "#aaa", fontSize: 13 },
//   price: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   period: { color: "#888", fontSize: 12 },
//   restoreBtn: { marginTop: 20, alignSelf: "center", padding: 10 },
//   restoreText: { color: "#666", textDecorationLine: "underline" },
//   disclaimer: {
//     marginTop: 20,
//     color: "#444",
//     fontSize: 11,
//     textAlign: "center",
//   },
//   errorText: { color: "#666", textAlign: "center", marginTop: 20 },
//   periodInline: {
//   color: "#888",
//   fontSize: 13,
//   fontWeight: "500",
// },
// });

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
  Linking, // <-- Add this
  View,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";

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
        await initializeIAP("anonymous_user");
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

  const handlePurchase = async (
    tier: SubscriptionTier,
    cycle: "MONTHLY" | "YEARLY",
    hasPkg: boolean
  ) => {
    if (!hasPkg) {
      Alert.alert(
        "Store Connecting",
        "The App Store is syncing this price. Please try again in a moment."
      );
      return;
    }
    
    if (loading) return;
    setLoading(true);

    const result = await purchaseSubscription(tier, cycle);

    if (result.success) {
      Alert.alert("Success", "Subscription activated! Welcome to Pro.");
      router.back();
    } else {
      if (result.actionTaken === "REDIRECT") {
        // Handle redirect if needed
      } else if (result.error) {
        Alert.alert("Purchase Failed", result.error);
      }
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
    isBestValue: boolean = false
  ) => {
    // 1. FALLBACK PRICES (Crucial for App Review compliance)
    const fallbackPrice = tier === SubscriptionTier.PRO 
      ? (cycle === "YEARLY" ? "$499.99" : "$49.99")
      : (cycle === "YEARLY" ? "$99.99" : "$9.99");

    const title = pkg?.product.title || (tier === SubscriptionTier.PRO ? "Pro Access" : "Plus Access");
    const description = pkg?.product.description || "Unlock all advanced AI features";

    return (
      <TouchableOpacity
        style={[styles.card, isBestValue && styles.cardBestValue]}
        onPress={() => handlePurchase(tier, cycle, !!pkg)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeaderRow}>
          {isBestValue && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>BEST VALUE</Text>
            </View>
          )}
          {/* 2. SAVINGS BADGE Logic */}
          {cycle === "YEARLY" && (
            <View style={[styles.savingsBadge, !isBestValue && { marginLeft: 0 }]}>
              <Text style={styles.savingsText}>SAVE 16.64%</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            {/* 3. ROW VIEW for Price + /Period */}
            <View style={{ flexDirection: "row", alignItems: "baseline" }}>
              <Text style={styles.price}>
                {pkg?.product?.priceString || fallbackPrice}
              </Text>
              <Text style={styles.period}>
                {cycle === "YEARLY" ? " /Year" : " /Month"}
              </Text>
            </View>
            
            {/* 4. BILLING TEXT */}
            <Text style={styles.billingNote}>
              {cycle === "YEARLY" ? "Billed yearly, cancel anytime" : "Billed monthly, cancel anytime"}
            </Text>
          </View>
        </View>
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Ionicons name="diamond" size={48} color="#4ADE80" />
          <Text style={styles.heroTitle}>Unlock Traders AI</Text>
          <Text style={styles.heroSubtitle}>
            Unlimited signals, AI predictions, and real-time alerts.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.features}>
          <FeatureItem text="Unlimited AI Trading Signals" />
          <FeatureItem text="Advanced Chart Patterns" />
          <FeatureItem text="Ad-Free Experience" />
        </View>

        {/* PRO TIER */}
        <Text style={styles.sectionHeader}>Pro Plan</Text>
        {renderPackageCard(packages?.proYearly || null, SubscriptionTier.PRO, "YEARLY", true)}
        {renderPackageCard(packages?.proMonthly || null, SubscriptionTier.PRO, "MONTHLY")}

        {/* PLUS TIER */}
        <Text style={styles.sectionHeader}>Plus Plan</Text>
        {renderPackageCard(packages?.plusYearly || null, SubscriptionTier.PLUS, "YEARLY")}
        {renderPackageCard(packages?.plusMonthly || null, SubscriptionTier.PLUS, "MONTHLY")}

        {/* Footer Actions */}
        <TouchableOpacity style={styles.restoreBtn} onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Recurring billing, cancel anytime via Store settings.
        </Text>

        {/* NEW: Legal Links for Apple Review (Guideline 3.1.2) */}
        <View style={styles.legalLinksContainer}>
          <TouchableOpacity 
            onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
          >
            <Text style={styles.legalLink}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}> • </Text>
          <TouchableOpacity 
             // Replace this with your actual privacy policy URL when you have one
            onPress={() => Linking.openURL('https://www.freeprivacypolicy.com/live/12345678-abcd-1234-abcd-12345678abcd')} 
          >
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
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
  container: { flex: 1, backgroundColor: "#000000" },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  closeButton: { padding: 4 },
  scrollContent: { padding: 20, paddingBottom: 50 },
  hero: { alignItems: "center", marginBottom: 30 },
  heroTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "#aaa",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
  },
  features: {
    marginBottom: 30,
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 16,
  },
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
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 12,
    overflow: "hidden",
  },
  cardBestValue: { borderColor: "#4ADE80", backgroundColor: "#1a2e21" },
  
  // Header Row for Badges
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12, // Move padding here so badges sit at top
    paddingHorizontal: 16,
  },
  
  badge: {
    backgroundColor: "#4ADE80",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: { color: "#000", fontWeight: "bold", fontSize: 11 },
  
  savingsBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.2)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8,
    alignSelf: "flex-start",
  },
  savingsText: {
    color: "#4ADE80",
    fontSize: 10,
    fontWeight: "bold",
  },

  cardContent: {
    padding: 16,
    paddingTop: 8, // Reduce top padding since we have the header row
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDesc: { color: "#aaa", fontSize: 13 },
  
  // Price Styles
  price: { color: "#fff", fontSize: 19, fontWeight: "bold" },
  period: { 
    color: "#aaa", 
    fontSize: 13, 
    fontWeight: "600", 
    marginLeft: 2 
  },
  billingNote: {
    color: "#666",
    fontSize: 10,
    marginTop: 3,
    textAlign: "right",
  },
  restoreBtn: { marginTop: 20, alignSelf: "center", padding: 10 },
  restoreText: { color: "#666", textDecorationLine: "underline" },
  disclaimer: {
    marginTop: 20,
    color: "#444",
    fontSize: 11,
    textAlign: "center",
  },
  // Add these to your existing styles
  legalLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
  },
  legalLink: {
    color: "#888",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  legalDivider: {
    color: "#555",
    fontSize: 12,
    marginHorizontal: 8,
  },
});