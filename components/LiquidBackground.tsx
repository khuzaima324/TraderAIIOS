import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width, height } = Dimensions.get("window");

interface Props {
  children: React.ReactNode;
}

export const LiquidBackground = ({ children }: Props) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.backgroundBase} />

      <LinearGradient
        colors={["rgba(10, 132, 255, 0.4)", "transparent"]}
        style={[styles.orb, styles.orbTopLeft]}
        start={{ x: 0.2, y: 0.2 }}
        end={{ x: 0.8, y: 0.8 }}
      />

      <LinearGradient
        colors={["rgba(191, 90, 242, 0.3)", "transparent"]}
        style={[styles.orb, styles.orbBottomRight]}
        start={{ x: 0.8, y: 0.8 }}
        end={{ x: 0, y: 0 }}
      />

      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#050505",
  },
  orb: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
  },
  orbTopLeft: {
    top: -width * 0.4,
    left: -width * 0.4,
    opacity: 0.6,
  },
  orbBottomRight: {
    bottom: -width * 0.3,
    right: -width * 0.3,
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
});