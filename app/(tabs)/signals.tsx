import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTracker } from "@/context/TrackerContext";
import * as Haptics from "expo-haptics";
import React from "react";
import { Alert, Platform, StatusBar, StyleSheet, View } from "react-native";
import { BottomTabNav } from "../../components/GlassComponents";
import { SignalsFeed } from "../../components/SignalFeed";
import { addToHistory } from "../../services/history";
import { HistoryItem } from "../../types";

export default function SignalsScreen() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const { signals, handleRemoveSignal } = useTracker();

  const handleRemoveSignalUI = async (id: string) => {
    await handleRemoveSignal(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveTrade = async (item: HistoryItem) => {
    if (!user) {
      Alert.alert("Not Logged In", "Please login to place orders.");
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      await addToHistory(user.uid, item);

      if (item.id) {
        handleRemoveSignalUI(item.id);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Error",
        "Could not place order. Please check your connection.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SignalsFeed
        signals={signals}
        onRemoveSignal={handleRemoveSignalUI}
        onSaveTrade={handleSaveTrade}
        language={language}
      />

      <BottomTabNav activeTab="signals" language={language} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: Platform.OS === "android" ? 30 : 50,
  },
});