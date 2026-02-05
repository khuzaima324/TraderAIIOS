import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import Purchases from "react-native-purchases";
import { BottomTabNav } from "../../components/GlassComponents";
import { Profile } from "../../components/Profile";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { logoutUser } from "../../services/firebase";
import { setSoundEnabled } from "../../services/soundService";
import { SubscriptionTier } from "../../types";

export default function ProfileScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const { user, subscriptionTier, refreshSubscription } = useAuth();
  const [credits, setCredits] = useState(0);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    const loadSoundSetting = async () => {
      try {
        const saved = await AsyncStorage.getItem("haptic_enabled");
        if (saved !== null) {
          const isEnabled = JSON.parse(saved);
          setSound(isEnabled);
          setSoundEnabled(isEnabled);
        }
      } catch (e) {
        console.log("Failed to load sound settings");
      }
    };
    loadSoundSetting();
  }, []);

  useEffect(() => {
    setSoundEnabled(sound);

    AsyncStorage.setItem("haptic_enabled", JSON.stringify(sound)).catch((e) =>
      console.log("Failed to save sound settings"),
    );
  }, [sound]);

  const handleLogout = async () => {
    try {
      await Purchases.logOut();
      await logoutUser();
      router.replace("/");
    } catch (e) {
      console.log("Logout error", e);
    }
  };

  const handleUpgrade = async (newTier: SubscriptionTier) => {
    await refreshSubscription();
  };

  const handleBuyCredits = (packId: string) => {
    setCredits((prev) => prev + 500);
    alert("Credits Added!");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Profile
        currentTier={subscriptionTier}
        credits={credits}
        userEmail={user?.email || "user@example.com"}
        userId={user?.uid || "GUEST-ID"}
        language={language}
        onLanguageChange={setLanguage}
        soundEnabled={sound}
        onToggleSound={setSound}
        onLogout={handleLogout}
        onUpgrade={handleUpgrade}
        onBuyCredits={handleBuyCredits}
        totalTrades={12}
        joinDate={Date.now()}
      />
      <BottomTabNav activeTab="profile" language={language} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: Platform.OS === "android" ? 30 : 50,
  },
});