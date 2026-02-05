import React from "react";
import { Platform, StatusBar, StyleSheet, View } from "react-native";
import { BottomTabNav } from "../../components/GlassComponents";
import { TweetTracker } from "../../components/TweetTracker";
import { useLanguage } from "../../context/LanguageContext";

export default function TrackerScreen() {
  const { language } = useLanguage();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <TweetTracker language={language} />

      <BottomTabNav activeTab="tracker" language={language} />
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