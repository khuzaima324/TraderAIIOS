import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import React, { useEffect, useState } from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { BottomTabNav } from "../../components/GlassComponents";
import { History } from "../../components/History";
import { removeFromHistory, subscribeToHistory } from "../../services/history";
import { HistoryItem } from "../../types";

export default function HistoryScreen() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToHistory(user.uid, (data) =>
      setHistoryItems(data),
    );
    return () => unsubscribe();
  }, [user]);

  const handleRemove = async (itemId: string) => {
    if (user) await removeFromHistory(user.uid, itemId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <History
        items={historyItems}
        language={language}
        onRemoveItem={handleRemove}
      />

      <BottomTabNav activeTab="history" language={language} />
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