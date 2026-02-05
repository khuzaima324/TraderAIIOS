import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

let isEnabled = true;

export const setSoundEnabled = (enabled: boolean) => {
  isEnabled = enabled;
};

export const playHapticClick = async () => {
  if (!isEnabled) return;

  if (Platform.OS !== "web") {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.warn("Haptics not supported");
    }
  }
};

export const playScanStart = async () => {
  if (!isEnabled) return;

  if (Platform.OS !== "web") {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.warn("Haptics not supported");
    }
  }
};

export const playSuccessSound = async () => {
  if (!isEnabled) return;

  if (Platform.OS !== "web") {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.warn("Haptics not supported");
    }
  }
};

export const playErrorSound = async () => {
  if (!isEnabled) return;

  if (Platform.OS !== "web") {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.warn("Haptics not supported");
    }
  }
};