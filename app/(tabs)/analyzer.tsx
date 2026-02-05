import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { Analyzer } from "../../components/Analyzer";
import { BottomTabNav } from "../../components/GlassComponents";
import { useLanguage } from "../../context/LanguageContext";
import { SubscriptionTier } from "../../types";

export default function AnalyzerScreen() {
  const { language } = useLanguage();

  const handleSave = (item: any) => {};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <Analyzer
        onSaveTrade={handleSave}
        userTier={SubscriptionTier.PRO}
        language={language}
      />
      <BottomTabNav activeTab="analyzer" language={language} />
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