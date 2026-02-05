import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { saveDeviceToken } from "./database";

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowBanner: true,
//     shouldShowList: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//   }),
// });

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // ✅ Replaces shouldShowBanner & shouldShowList
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const initPushNotifications = async (
  userId: string,
  onNavigate: (path: string) => void,
) => {
  try {
    if (!Device.isDevice) {
      console.log("⚠️ Must use physical device for Push Notifications");
      return;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("🔴 Notification permission denied");
      return;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId, // Auto-detects project ID
    });
    const token = tokenData.data;

    console.log("📲 My Expo Token:", token);

    if (userId && token) {
      await saveDeviceToken(userId, token);
    }

    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("🔔 Foreground Notification:", notification);
      },
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("👆 Notification Clicked:", response);
        const data = response.notification.request.content.data;

        if (data?.screen === "SignalDetails" || data?.screen === "tracker") {
          onNavigate("/(tabs)/tracker");
        }
      },
    );

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  } catch (error) {
    console.error(" Error init notifications:", error);
  }
};

export const sendLocalNotification = async (
  title: string,
  body: string,
  data: any = {},
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      data: data,
      sound: "default",
    },
    trigger: null,
  });
};