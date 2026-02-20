import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import {
  playErrorSound,
  playHapticClick,
  playScanStart,
  playSuccessSound,
} from "../services/soundService";

import {
  auth,
  getFriendlyErrorMessage,
  updateUserPassword,
  updateUserProfile,
} from "../services/firebase";

import {
  getActivePlanExpiration,
  getAppOfferings,
  getCurrentActiveProductId,
  IAPPackages,
  purchaseSubscription,
  restorePurchases,
} from "../services/iapService";
import { translations } from "../services/translations";
import { LanguageCode, SubscriptionTier, SUPPORTED_LANGUAGES } from "../types";
import {
  Badge,
  GlassBox,
  GlassButton,
  GlassInput,
  SegmentedControl,
} from "./GlassComponents";

const { height } = Dimensions.get("window");

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CREDIT_PACKS = {
  PACK_500: { id: "pack_500", amount: 500, price: "$5.00" },
  PACK_1000: { id: "pack_1000", amount: 1000, price: "$10.00" },
  PACK_2500: { id: "pack_2500", amount: 2500, price: "$25.00" },
};

const COLORS = {
  cardBg: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.1)",
  modalBg: "rgba(28, 28, 30, 0.85)",
};

interface ProfileProps {
  currentTier: SubscriptionTier;
  onUpgrade: (newTier: SubscriptionTier) => void;
  onBuyCredits: (packId: string) => void;
  credits: number;
  onLogout: () => void;
  userId: string;
  totalTrades: number;
  joinDate: number;
  userEmail: string | null;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
}

type ModalState =
  | "NONE"
  | "CHANGE_EMAIL"
  | "CHANGE_PASSWORD"
  | "TERMS"
  | "LANGUAGE"
  | "SUBSCRIPTION";

export const Profile: React.FC<ProfileProps> = ({
  currentTier: _ignoredTier, // 1. Rename prop to ignore it
  onUpgrade,
  onBuyCredits,
  credits,
  onLogout,
  userId,
  userEmail,
  language,
  onLanguageChange,
  soundEnabled,
  onToggleSound,
}) => {
  const { subscriptionTier } = useAuth();
  const currentTier = subscriptionTier;

  const t = translations[language] || translations["en"];
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">(
    "MONTHLY",
  );
  const [activeModal, setActiveModal] = useState<ModalState>("NONE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCredits, setShowCredits] = useState(false);

  const [isPurchasing, setIsPurchasing] = useState(false);
  const [packages, setPackages] = useState<IAPPackages>({
    plusMonthly: null,
    plusYearly: null,
    proMonthly: null,
    proYearly: null,
  });

  const [expirationDate, setExpirationDate] = useState<string | null>(null);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "the billing cycle ends";
    return new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [cancelInput, setCancelInput] = useState("");

  // Forms
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  // const isGoogleUser = auth().currentUser?.providerData.some(
  //   (provider: any) => provider.providerId === "google.com",
  // );

  // Check if user is signed in via ANY social provider (Google or Apple)
  // const isSocialUser = auth().currentUser?.providerData.some(
  //   (provider: any) =>
  //     provider.providerId === "google.com" ||
  //     provider.providerId === "apple.com",
  // );

  // Get the list of providers (e.g., password, google.com, apple.com)
  const providers = auth().currentUser?.providerData || [];

  const isGoogle = providers.some((p) => p.providerId === "google.com");
  const isApple = providers.some((p) => p.providerId === "apple.com");
  const isSocialUser = isGoogle || isApple; // Use this to hide the Password/Email section

  useEffect(() => {
    const fetchData = async () => {
      const pkgs = await getAppOfferings();
      setPackages(pkgs);

      const activeId = await getCurrentActiveProductId();
      setActiveProductId(activeId);

      const date = await getActivePlanExpiration();
      setExpirationDate(date);
    };

    if (activeModal === "SUBSCRIPTION") {
      fetchData();
    }
  }, [activeModal, currentTier]);

  const handlePurchase = async (tier: SubscriptionTier) => {
    setIsPurchasing(true);
    playScanStart();
    try {
      const result = await purchaseSubscription(tier, billingCycle);

      if (result.success && result.newTier) {
        if (result.activeProductId) setActiveProductId(result.activeProductId);
        playSuccessSound();
        // Update Firebase
        await updateUserProfile(userId, { tier: result.newTier });

        // Notify parent
        onUpgrade(result.newTier);
        Alert.alert("Success", "Subscription activated!");
      } else if (result.error) {
        Alert.alert("Purchase Failed", result.error);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    setIsPurchasing(true);
    playHapticClick();
    try {
      const { tier, activeProductId: restoredId } = await restorePurchases();
      setActiveProductId(restoredId);

      if (tier !== SubscriptionTier.FREE) {
        await updateUserProfile(userId, { tier });
        playSuccessSound();
        onUpgrade(tier);
        Alert.alert("Restore Successful", "Your purchases have been restored.");
      } else {
        Alert.alert("Restore", "No active subscriptions found.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleFreeAction = () => {
    if (currentTier === SubscriptionTier.FREE) {
      closeModal();
      return;
    }

    const dateStr = formatDate(expirationDate);

    Alert.alert(
      "Manage Subscription",
      `You are currently on the ${currentTier} plan.\n\nIf you cancel, you will retain access until ${dateStr}, after which you will be automatically downgraded to the Free plan.`,
      [
        { text: "Keep Plan", style: "cancel" },
        {
          text: "Cancel Auto-Renewal",
          style: "destructive",
          onPress: () => setShowCancelModal(true),
        },
      ],
    );
  };

  const processCancellation = async () => {
    if (cancelInput.trim().toLowerCase() !== "cancel") {
      Alert.alert("Error", "Please type 'cancel' correctly to confirm.");
      return;
    }

    try {
      if (Platform.OS === "ios") {
        Linking.openURL("https://apps.apple.com/account/subscriptions");
      } else {
        Linking.openURL("https://play.google.com/store/account/subscriptions");
      }

      setCancelInput("");
      setShowCancelModal(false);

      const dateStr = formatDate(expirationDate);

      Alert.alert(
        "Redirecting...",
        `Please cancel the subscription in the store to stop future billing.\n\nYou will keep your Pro/Plus benefits until ${dateStr}.`,
      );
    } catch (e: any) {
      Alert.alert("Error", "Failed to open settings: " + e.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput.trim().toLowerCase() !== "delete") {
      Alert.alert("Error", "Please type 'delete' correctly to confirm.");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth().currentUser;
      if (user) {
        // Here you would also add logic to delete user data from Firestore if you have any
        await user.delete(); 
        
        setShowDeleteModal(false);
        setDeleteInput("");
        playSuccessSound();
        Alert.alert(
          "Account Deleted", 
          "Your account and data have been scheduled for deletion within 14 days. If you wish to cancel this, please log back in within 14 days."
        );
        onLogout(); // Log the user out immediately
      }
    } catch (e: any) {
      if (e.code === 'auth/requires-recent-login') {
        Alert.alert("Error", "For security reasons, please log out and log back in before deleting your account.");
      } else {
        Alert.alert("Error", "Failed to delete account: " + e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: "CREDITS") => {
    playHapticClick();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === "CREDITS") setShowCredits(!showCredits);
  };

  const closeModal = () => {
    setActiveModal("NONE");
    resetFormState();
    playHapticClick();
  };

  const resetFormState = () => {
    setError(null);
    setSuccessMsg(null);
    setCurrentPassword("");
    setNewPasswordInput("");
    setConfirmPassword("");
    setNewEmail("");
  };

  const handleEmailSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg("Email update link sent!");
      playSuccessSound();
      setTimeout(closeModal, 1500);
    }, 1000);
  };

  const handlePasswordSave = async () => {
    setError(null);
    setSuccessMsg(null);
    if (!currentPassword || !newPasswordInput || !confirmPassword)
      return setError("Please fill in all fields.");
    setIsLoading(true);
    try {
      await updateUserPassword(currentPassword, newPasswordInput);
      setSuccessMsg("Password updated successfully!");
      setTimeout(closeModal, 1500);
      playSuccessSound();
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
      playErrorSound();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateUs = () => {
    Alert.alert("Rate Us", "Thank you for rating us 5 stars! ⭐️⭐️⭐️⭐️⭐️");
  };

  const renderEyeIcon = (isVisible: boolean, onToggle: () => void) => (
    <TouchableOpacity
      onPress={() => {
        onToggle();
        playHapticClick();
      }}
    >
      <Ionicons
        name={isVisible ? "eye-off" : "eye"}
        size={20}
        color="rgba(255,255,255,0.4)"
      />
    </TouchableOpacity>
  );

  const currencySymbol =
    packages.plusMonthly?.product.priceString?.replace(/[0-9.,]/g, "").trim() ||
    "$";

  const freePriceDisplay = `${currencySymbol} 0`;

  const checkIsActive = (
    targetTier: SubscriptionTier,
    targetCycle: "MONTHLY" | "YEARLY",
  ) => {
    if (!activeProductId) return false;
    const id = activeProductId.toLowerCase();

    const isMonthly = id.includes("monthly") || id.includes("1m");
    const isYearly = id.includes("yearly") || id.includes("1y");

    if (targetTier === SubscriptionTier.PLUS && id.includes("plus")) {
      return targetCycle === "MONTHLY" ? isMonthly : isYearly;
    }
    if (targetTier === SubscriptionTier.PRO && id.includes("pro")) {
      return targetCycle === "MONTHLY" ? isMonthly : isYearly;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>{t.profile_title || "Profile"}</Text>
          <Text style={styles.headerSubtitle}>
            {t.account_membership || "Account & Membership"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <View style={styles.userSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {userEmail ? userEmail[0].toUpperCase() : "U"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={styles.emailText} numberOfLines={1}>
                {userEmail || "Guest"}
              </Text>
              {/* Show Google Logo */}
              {isGoogle && (
                <Ionicons name="logo-google" size={14} color="#aaa" />
              )}

              {/* Show Apple Logo */}
              {isApple && <Ionicons name="logo-apple" size={14} color="#aaa" />}
            </View>

            <View style={styles.badgeRow}>
              <Badge
                color={
                  currentTier === SubscriptionTier.PRO
                    ? "blue"
                    : currentTier === SubscriptionTier.PLUS
                      ? "green"
                      : "gray"
                }
              >
                {currentTier === SubscriptionTier.PRO
                  ? t.elite_member || "Elite Member"
                  : currentTier === SubscriptionTier.PLUS
                    ? t.plus_member || "Plus Member"
                    : t.basic_member || "Basic Member"}
              </Badge>
              <Text style={styles.idText}>
                ID: {userId?.slice(0, 8).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Settings</Text>

        <GlassBox style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => setActiveModal("SUBSCRIPTION")}
            style={styles.settingRow}
          >
            <View style={styles.accordionLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#0A84FF" }]}>
                <Ionicons name="sparkles" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.optionTitle}>
                  {t.membership_plans || "Membership"}
                </Text>
                <Text style={[styles.optionSub, { color: "#0A84FF" }]}>
                  {t.upgrade || "Upgrade"}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>
        </GlassBox>

        {/* Credits Accordion */}
        {/* <GlassBox
          style={[styles.accordionCard, showCredits && styles.accordionActive]}
        >
          <TouchableOpacity
            onPress={() => toggleSection("CREDITS")}
            style={styles.accordionHeader}
          >
            <View style={styles.accordionLeft}>
              <View style={[styles.iconBox, { backgroundColor: "#FF9500" }]}>
                <Ionicons name="wallet" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.optionTitle}>
                  {t.credits_wallet || "Credits Wallet"}
                </Text>
                <Text style={[styles.optionSub, { color: "#FF9500" }]}>
                  {t.credits_balance || "Balance"}: {credits}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-up"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          {showCredits && (
            <View style={styles.accordionBody}>
              <View style={styles.costInfo}>
                <Text style={styles.costText}>
                  {t.cost_analysis || "Cost per analysis"}
                </Text>
                <Text style={styles.costText}>
                  {t.cost_tracker || "Cost per tracker"}
                </Text>
              </View>
              <Text style={styles.buyLabel}>
                {t.buy_credits || "Buy Credits"}
              </Text>
              <View style={styles.creditGrid}>
                {Object.values(CREDIT_PACKS).map((pack) => (
                  <TouchableOpacity
                    key={pack.id}
                    onPress={() => {
                      onBuyCredits(pack.id), playHapticClick();
                    }}
                    style={styles.creditBtn}
                  >
                    <Text style={styles.creditAmount}>{pack.amount}</Text>
                    <Text style={styles.creditPrice}>{pack.price}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </GlassBox> */}

        {/* <GlassBox style={[styles.accordionCard, { opacity: 0.7 }]}>
          <View style={styles.accordionHeader}>
            <View style={styles.accordionLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "rgba(255,255,255,0.1)" },
                ]}
              >
                <Ionicons name="lock-closed" size={18} color="#aaa" />
              </View>
              <View>
                <Text
                  style={[
                    styles.optionTitle,
                    { color: "rgba(255,255,255,0.5)" },
                  ]}
                >
                  {t.credits_wallet || "Credits Wallet"}
                </Text>
                <Text
                  style={{
                    color: "#FF9500",
                    fontSize: 10,
                    fontWeight: "bold",
                    marginTop: 2,
                  }}
                >
                  COMING SOON
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="time-outline"
                size={14}
                color="rgba(255,255,255,0.2)"
              />
            </View>
          </View>

        </GlassBox> */}

        <GlassBox style={styles.cardContainer}>
          <TouchableOpacity
            onPress={() => setActiveModal("LANGUAGE")}
            style={styles.settingRow}
          >
            <View style={styles.accordionLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "rgba(255,255,255,0.1)" },
                ]}
              >
                <Ionicons name="language" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.optionTitle}>
                  {t.language || "Language"}
                </Text>
                <Text style={styles.optionSub}>
                  {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.label}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-down"
              size={18}
              color="rgba(255,255,255,0.5)"
            />
          </TouchableOpacity>

          <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
            <View style={styles.accordionLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "rgba(255,255,255,0.1)" },
                ]}
              >
                <Ionicons name="finger-print" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.optionTitle}>
                  {t.haptic_sounds || "Haptic Sounds"}
                </Text>
                <Text style={styles.optionSub}>
                  {soundEnabled ? "On" : "Off"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                playHapticClick();
                onToggleSound(!soundEnabled);
              }}
              style={[styles.toggleSwitch, soundEnabled && styles.toggleActive]}
            >
              <View
                style={[styles.toggleKnob, soundEnabled && styles.knobActive]}
              />
            </TouchableOpacity>
          </View>
        </GlassBox>

        {/* SECURITY */}
        {!isSocialUser && (
          <>
            <Text style={styles.sectionHeader}>
              {t.security_settings || "Security"}
            </Text>
            <GlassBox style={styles.cardContainer}>
              <TouchableOpacity
                onPress={() => setActiveModal("CHANGE_EMAIL")}
                style={styles.settingRow}
              >
                <View style={styles.accordionLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: "rgba(255,255,255,0.1)" },
                    ]}
                  >
                    <Ionicons name="mail" size={18} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>
                      {t.change_email || "Change Email"}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(255,255,255,0.3)"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActiveModal("CHANGE_PASSWORD")}
                style={[styles.settingRow, { borderBottomWidth: 0 }]}
              >
                <View style={styles.accordionLeft}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: "rgba(255,255,255,0.1)" },
                    ]}
                  >
                    <Ionicons name="lock-closed" size={18} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.optionTitle}>
                      {t.change_pass || "Change Password"}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(255,255,255,0.3)"
                />
              </TouchableOpacity>
            </GlassBox>
          </>
        )}

        {/* SUPPORT */}
        <Text style={styles.sectionHeader}>{t.support_legal || "Support"}</Text>
        <GlassBox style={styles.cardContainer}>
          <TouchableOpacity onPress={handleRateUs} style={styles.settingRow}>
            <View style={styles.accordionLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "rgba(255,149,0,0.15)" },
                ]}
              >
                <Ionicons name="star" size={18} color="#FF9500" />
              </View>
              <View>
                <Text style={styles.optionTitle}>{t.rate_us || "Rate Us"}</Text>
                <Text style={styles.optionSub}>{t.rate_desc || "5 Stars"}</Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveModal("TERMS")}
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
          >
            <View style={styles.accordionLeft}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: "rgba(255,255,255,0.1)" },
                ]}
              >
                <Ionicons name="document-text" size={18} color="#fff" />
              </View>
              <View>
                <Text style={styles.optionTitle}>
                  {t.terms_cond || "Terms"}
                </Text>
                <Text style={styles.optionSub}>
                  {t.terms_desc || "Read Terms"}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.3)"
            />
          </TouchableOpacity>
        </GlassBox>

        {/* ADVANCED / DANGER ZONE */}
        <Text style={[styles.sectionHeader, { color: "#FF3B30", opacity: 0.8 }]}>
          {t.advanced || "Advanced"}
        </Text>
        <GlassBox style={[styles.cardContainer, { borderColor: "rgba(255,59,48,0.2)" }]}>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
          >
            <View style={styles.accordionLeft}>
              <View style={[styles.iconBox, { backgroundColor: "rgba(255,59,48,0.15)" }]}>
                <Ionicons name="trash" size={18} color="#FF3B30" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Delete Account</Text>
                <Text style={styles.optionSub}>Permanently remove data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
          </TouchableOpacity>
        </GlassBox>

        {/* LOGOUT */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            onPress={() => {
              playHapticClick();
              onLogout();
            }}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>{t.logout || "Logout"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={activeModal === "SUBSCRIPTION"}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.fullModalContainer}>
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.fullModalHeader}>
            <TouchableOpacity
              onPress={closeModal}
              style={styles.closeBtnCircle}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitleText}>
              {t.membership_plans || "Plans"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView
            contentContainerStyle={styles.fullModalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cycleToggleContainer}>
              <SegmentedControl
                options={[t.monthly || "Monthly", t.yearly || "Yearly"]}
                selected={
                  billingCycle === "MONTHLY"
                    ? t.monthly || "Monthly"
                    : t.yearly || "Yearly"
                }
                onChange={(val) => {
                  playHapticClick();
                  setBillingCycle(
                    val === (t.monthly || "Monthly") ? "MONTHLY" : "YEARLY",
                  );
                }}
              />
            </View>

            <GlassBox style={styles.premiumPlanCard}>
              <Text style={styles.premiumPlanName}>Free</Text>
              <Text style={styles.premiumPlanPrice}>{freePriceDisplay}</Text>
              <View style={styles.premiumDivider} />
              <Text style={styles.premiumFeature}>
                • {t.feat_1_tracker || "1 Tracker"}
              </Text>
              <Text style={styles.premiumFeature}>
                • {t.feat_3_manual || "1 Manual Scan"}
              </Text>
              <Text style={styles.premiumFeature}>
                • {t.feat_3_basic || "1 Basic Chart Analysis"}
              </Text>
              <GlassButton
                variant="secondary"
                style={styles.premiumBtn}
                disabled={currentTier === SubscriptionTier.FREE}
                onPress={handleFreeAction}
              >
                {currentTier === SubscriptionTier.FREE
                  ? t.current_plan || "Current Plan"
                  : t.downgrade || "Downgrade"}
              </GlassButton>
            </GlassBox>

            {/* PLUS PLAN CARD */}
          {/* PLUS PLAN CARD */}
            {/* PLUS PLAN CARD */}
            <GlassBox
              style={[
                styles.premiumPlanCard,
                {
                  borderColor: "rgba(48,209,88,0.3)",
                  backgroundColor: "rgba(48,209,88,0.05)",
                  position: "relative", // Needed for floating badge
                },
              ]}
            >
              {/* Header */}
              <View style={styles.rowJustify}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.premiumPlanName, { color: "#30D158" }]}>
                    Plus
                  </Text>
                  <Badge color="green">POPULAR</Badge>
                </View>
              </View>

              {/* Price & Billing */}
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <Text style={styles.premiumPlanPrice}>
                  {billingCycle === "MONTHLY"
                    ? packages.plusMonthly?.product.priceString || "..."
                    : packages.plusYearly?.product.priceString || "..."}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: "600" }}>
                  / {billingCycle === "MONTHLY" ? "Month" : "Year"}
                </Text>
              </View>

              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 12 }}>
                {billingCycle === "MONTHLY" 
                  ? "Billed monthly, cancel anytime" 
                  : "Billed yearly, cancel anytime"}
              </Text>

              <View style={styles.premiumDivider} />
              
              <Text style={styles.premiumFeature}>• {t.feat_7_tracker || "5 Trackers"}</Text>
              <Text style={styles.premiumFeature}>• {t.feat_live_monitor || "Live Monitoring"}</Text>
              <Text style={styles.premiumFeature}>• {t.feat_pro_analysis || "Pro Analysis"}</Text>
              <Text style={styles.premiumFeature}>• {t.feat_14_manual || "Manual Scan"}</Text>

              <GlassButton
                variant="success"
                style={styles.premiumBtn}
                isLoading={isPurchasing}
                disabled={checkIsActive(SubscriptionTier.PLUS, billingCycle)}
                onPress={() => handlePurchase(SubscriptionTier.PLUS)}
              >
                {checkIsActive(SubscriptionTier.PLUS, billingCycle)
                  ? t.current_plan || "Current Plan"
                  : t.upgrade_plus || "Upgrade to Plus"}
              </GlassButton>

              {/* FLOATING SAVINGS BADGE (Yearly Only) */}
              {billingCycle === "YEARLY" && (
                <View style={styles.floatingBadge}>
                  <Text style={styles.floatingBadgeText}>SAVE 16%</Text>
                </View>
              )}
            </GlassBox>

            {/* PRO PLAN CARD */}
            {/* PRO PLAN CARD */}
            <GlassBox
              style={[
                styles.premiumPlanCard,
                {
                  borderColor: "rgba(10,132,255,0.3)",
                  backgroundColor: "rgba(10,132,255,0.05)",
                  position: "relative", // Needed for floating badge
                },
              ]}
            >
              {/* Header */}
              <View style={styles.rowJustify}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={[styles.premiumPlanName, { color: "#0A84FF" }]}>
                    Pro
                  </Text>
                </View>
              </View>

              {/* Price & Billing */}
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 4 }}>
                <Text style={styles.premiumPlanPrice}>
                  {billingCycle === "MONTHLY"
                    ? packages.proMonthly?.product.priceString || "..."
                    : packages.proYearly?.product.priceString || "..."}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: "600" }}>
                  / {billingCycle === "MONTHLY" ? "Month" : "Year"}
                </Text>
              </View>

              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 12 }}>
                {billingCycle === "MONTHLY" 
                  ? "Billed monthly, cancel anytime" 
                  : "Billed yearly, cancel anytime"}
              </Text>

              <View style={styles.premiumDivider} />
              
              <Text style={styles.premiumFeature}>• {t.feat_15_tracker || "12 Trackers"}</Text>
              <Text style={styles.premiumFeature}>• {t.feat_bg_monitor || "Background Monitor"}</Text>
              <Text style={styles.premiumFeature}>• {t.feat_deep_market || "Deep Market Data"}</Text>
              <Text style={styles.premiumFeature}>• {t.feat_unlimited_manual || "15 manual scans"}</Text>
              <Text style={styles.premiumFeature}>• {t.feat_15_analysis || "Analyses Daily"}</Text>

              <GlassButton
                variant="primary"
                style={styles.premiumBtn}
                isLoading={isPurchasing}
                disabled={checkIsActive(SubscriptionTier.PRO, billingCycle)}
                onPress={() => handlePurchase(SubscriptionTier.PRO)}
              >
                {checkIsActive(SubscriptionTier.PRO, billingCycle)
                  ? t.current_plan || "Current Plan"
                  : t.get_pro || "Get Pro"}
              </GlassButton>

              {/* FLOATING SAVINGS BADGE (Yearly Only) */}
              {billingCycle === "YEARLY" && (
                <View style={styles.floatingBadge}>
                  <Text style={styles.floatingBadgeText}>SAVE 16%</Text>
                </View>
              )}
            </GlassBox>

            <TouchableOpacity
              onPress={handleRestorePurchases}
              disabled={isPurchasing}
            >
              <Text style={styles.restoreTextLink}>
                {isPurchasing
                  ? "Processing..."
                  : t.restore || "Restore Purchases"}
              </Text>
            </TouchableOpacity>

            {/* NEW: Legal Links for Apple Review (Guideline 3.1.2) */}
            <View style={styles.legalLinksContainer}>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
              >
                <Text style={styles.legalLink}>Terms of Use</Text>
              </TouchableOpacity>
              <Text style={styles.legalDivider}> • </Text>
              <TouchableOpacity 
                onPress={() => Linking.openURL('https://www.revenuecat.com/privacy/')} 
              >
                <Text style={styles.legalLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <GlassBox style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: "#FF3B30" }]}>
              Confirm Cancellation
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontWeight: "bold", color: "white" }}>
                "cancel"
              </Text>
              below to confirm.
            </Text>
            <Text style={styles.label}>TYPE CONFIRMATION</Text>
            <GlassInput
              value={cancelInput}
              onChangeText={setCancelInput}
              placeholder="cancel"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <GlassButton
                variant="ghost"
                onPress={() => {
                  setShowCancelModal(false);
                  setCancelInput("");
                }}
                style={{ flex: 1 }}
              >
                Back
              </GlassButton>
              <GlassButton
                onPress={processCancellation}
                isLoading={isPurchasing}
                style={{ flex: 1, backgroundColor: "#FF3B30" }}
              >
                Confirm
              </GlassButton>
            </View>
          </GlassBox>
        </View>
      </Modal>

      {/* EMAIL */}
      <Modal
        visible={activeModal === "CHANGE_EMAIL"}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <GlassBox style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t.update_email_btn || "Update Email"}
            </Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMsg && <Text style={styles.successText}>{successMsg}</Text>}
            <Text style={styles.label}>CURRENT EMAIL</Text>
            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyText}>{userEmail}</Text>
            </View>
            <Text style={styles.label}>NEW EMAIL</Text>
            <GlassInput
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="new@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <GlassButton
                variant="ghost"
                onPress={closeModal}
                style={{ flex: 1 }}
              >
                {t.cancel || "Cancel"}
              </GlassButton>
              <GlassButton
                onPress={handleEmailSave}
                isLoading={isLoading}
                style={{ flex: 1 }}
              >
                {t.update || "Update"}
              </GlassButton>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </GlassBox>
        </View>
      </Modal>

      {/* PASSWORD */}
      <Modal
        visible={activeModal === "CHANGE_PASSWORD"}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <GlassBox style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t.change_pass || "Change Password"}
            </Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            {successMsg && <Text style={styles.successText}>{successMsg}</Text>}
            <Text style={styles.label}>
              {t.current_pass || "Current Password"}
            </Text>
            <GlassInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="••••••"
              secureTextEntry={!showCurrentPass}
              rightElement={renderEyeIcon(showCurrentPass, () =>
                setShowCurrentPass(!showCurrentPass),
              )}
            />
            <Text style={styles.label}>{t.new_pass || "New Password"}</Text>
            <GlassInput
              value={newPasswordInput}
              onChangeText={setNewPasswordInput}
              placeholder="••••••"
              secureTextEntry={!showNewPass}
              rightElement={renderEyeIcon(showNewPass, () =>
                setShowNewPass(!showNewPass),
              )}
            />
            <Text style={styles.label}>
              {t.confirm_pass || "Confirm Password"}
            </Text>
            <GlassInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••"
              secureTextEntry={!showConfirmPass}
              rightElement={renderEyeIcon(showConfirmPass, () =>
                setShowConfirmPass(!showConfirmPass),
              )}
            />
            <View style={styles.modalButtons}>
              <GlassButton
                variant="ghost"
                onPress={closeModal}
                style={{ flex: 1 }}
              >
                {t.cancel || "Cancel"}
              </GlassButton>
              <GlassButton
                onPress={handlePasswordSave}
                isLoading={isLoading}
                style={{ flex: 1 }}
              >
                {t.update || "Update"}
              </GlassButton>
            </View>
            <TouchableOpacity onPress={closeModal} style={styles.closeIcon}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </GlassBox>
        </View>
      </Modal>

      {/* TERMS */}
      <Modal visible={activeModal === "TERMS"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={30}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.termsCard}>
            <View style={styles.termsHeader}>
              <Text style={styles.modalTitle}>{t.terms_cond || "Terms"}</Text>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.closeBtnSmall}
              >
                <Ionicons name="close" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.termsBodyContainer}>
              <ScrollView
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.termsScrollContent}
              >
                <Text style={styles.termsText}>
                  <Text style={styles.bold}>1. Introduction{"\n"}</Text>
                  Welcome to Traders AI. By using our application, you agree to
                  these terms.{"\n\n"}
                  <Text style={styles.bold}>2. Disclaimer{"\n"}</Text>
                  Trading involves substantial risk and is not suitable for
                  every investor. The AI analysis provided is for informational
                  purposes only and does not constitute financial advice.
                  {"\n\n"}
                  <Text style={styles.bold}>3. Subscription{"\n"}</Text>
                  Subscriptions are billed in advance on a recurring basis. You
                  can cancel at any time.{"\n\n"}
                  <Text style={styles.bold}>4. Credits{"\n"}</Text>
                  Credits purchased are non-refundable and can be used for
                  additional analyses or tracking slots.{"\n\n"}
                  <Text style={styles.bold}>5. Privacy{"\n"}</Text>
                  We value your privacy. Your data is stored securely and never
                  shared with third parties without consent.
                </Text>
              </ScrollView>
            </View>
            <View style={styles.termsFooter}>
              <TouchableOpacity
                onPress={closeModal}
                style={styles.fullWidthButton}
              >
                <Text style={styles.buttonText}>{t.close || "Close"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={activeModal === "LANGUAGE"}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView
            intensity={40}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <GlassBox style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.language || "Language"}</Text>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langOption,
                  language === lang.code && styles.langOptionActive,
                ]}
                onPress={() => {
                  onLanguageChange(lang.code);
                  closeModal();
                  playHapticClick();
                }}
              >
                <Text
                  style={[
                    styles.langText,
                    language === lang.code && {
                      color: "#0A84FF",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {lang.label}
                </Text>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={20} color="#0A84FF" />
                )}
              </TouchableOpacity>
            ))}
            <GlassButton
              variant="ghost"
              onPress={closeModal}
              style={{ marginTop: 10 }}
            >
              {t.cancel || "Cancel"}
            </GlassButton>
          </GlassBox>
        </View>
      </Modal>
      {/* DELETE ACCOUNT MODAL */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <GlassBox style={styles.modalCard}>
            <Text style={[styles.modalTitle, { color: "#FF3B30" }]}>
              Delete Account?
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", textAlign: "center", marginBottom: 20, lineHeight: 20 }}>
              Are you sure you want to delete your account and data?{"\n\n"}
              Type <Text style={{ fontWeight: "bold", color: "white" }}>delete</Text> below to confirm.
            </Text>
            <Text style={styles.label}>TYPE CONFIRMATION</Text>
            <GlassInput
              value={deleteInput}
              onChangeText={setDeleteInput}
              placeholder="delete"
              autoCapitalize="none"
            />
            <View style={styles.modalButtons}>
              <GlassButton
                variant="ghost"
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteInput("");
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </GlassButton>
              <GlassButton
                onPress={handleDeleteAccount}
                isLoading={isLoading}
                style={{ flex: 1, backgroundColor: "#FF3B30" }}
              >
                Delete
              </GlassButton>
            </View>
          </GlassBox>
        </View>
      </Modal>
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

  userSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarText: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  emailText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  idText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 10,
    marginTop: 18,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  cardContainer: {
    marginBottom: 12,
    overflow: "hidden",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    padding: 0,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },

  accordionCard: {
    padding: 0,
    overflow: "hidden",
    marginBottom: 10,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
  },
  accordionActive: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(10,132,255,0.2)",
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  accordionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  accordionBody: {
    padding: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },

  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  optionTitle: { fontSize: 14, fontWeight: "600", color: "#fff" },
  optionSub: { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 },

  costInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  costText: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  buyLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.6)",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  creditGrid: { flexDirection: "row", gap: 8 },
  creditBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  creditAmount: { fontWeight: "bold", color: "#FF9500", fontSize: 16 },
  creditPrice: { fontSize: 10, color: "rgba(255,255,255,0.5)" },

  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 2,
  },
  toggleActive: { backgroundColor: "#0A84FF" },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  knobActive: { alignSelf: "flex-end" },

  logoutContainer: { marginTop: 20, alignItems: "center" },
  logoutBtn: { padding: 16 },
  logoutText: { color: "#FF453A", fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  modalCard: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: COLORS.modalBg,
    borderColor: COLORS.border,
    borderWidth: 1,
    position: "relative",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: { flexDirection: "row", gap: 12, marginTop: 24 },
  closeIcon: { position: "absolute", top: 20, right: 20 },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 6,
    marginTop: 12,
  },
  readOnlyBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
    borderRadius: 12,
  },
  readOnlyText: { color: "rgba(255,255,255,0.7)" },
  errorText: {
    color: "#FF453A",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 12,
    backgroundColor: "rgba(255,69,58,0.1)",
    padding: 8,
    borderRadius: 8,
  },
  successText: {
    color: "#30D158",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 12,
    backgroundColor: "rgba(48,209,88,0.1)",
    padding: 8,
    borderRadius: 8,
  },

  langOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  langOptionActive: { backgroundColor: "rgba(10,132,255,0.1)" },
  langText: { color: "#fff", fontSize: 16 },

  termsCard: {
    width: "100%",
    height: height * 0.75,
    backgroundColor: COLORS.modalBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  termsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  termsBodyContainer: { flex: 1 },
  termsScrollContent: { padding: 20, paddingBottom: 40 },
  termsText: { color: "#FFFFFF", fontSize: 14, lineHeight: 22 },
  termsFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  fullWidthButton: {
    backgroundColor: "#0A84FF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  closeBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  bold: { fontWeight: "bold", color: "#fff" },

  fullModalContainer: { flex: 1, backgroundColor: "#000" },
  savingsText: {
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  fullModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullModalTitleText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  fullModalContent: { paddingHorizontal: 20, paddingBottom: 60 },
  cycleToggleContainer: { marginBottom: 10 },
  premiumPlanCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  premiumPlanName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  premiumPlanPrice: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 4,
  },
  premiumDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 8,
  },
  premiumFeature: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginBottom: 3,
  },
  premiumBtn: {
    marginTop: 15,
    borderRadius: 30,
    paddingVertical: 0,
  },
  restoreTextLink: {
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    marginTop: 16,
    textDecorationLine: "underline",
    fontSize: 12,
  },
  rowJustify: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  // Add inside StyleSheet.create({ ... })
  savingsBadge: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  floatingBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#4ade806f", // Solid green so it pops
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: "#000",
    paddingVertical: 6,
    borderRadius: 20, // High radius makes it fully rounded
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingBadgeText: {
    color: "#000", // Black text on green background
    fontSize: 10,
    fontWeight: "bold",
  },
  legalLinksContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40, // Extra space at bottom of modal
  },
  legalLink: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    textDecorationLine: "underline",
  },
  legalDivider: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 11,
    marginHorizontal: 8,
  },
});