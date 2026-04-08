// @ts-ignore
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

import firebase from "@react-native-firebase/app";
import "@react-native-firebase/app-check";
import "@react-native-firebase/auth";
import "@react-native-firebase/firestore";

const firebaseNative = firebase as any;

if (!firebaseNative.apps.length) {
  firebaseNative.initializeApp({} as any);
}

import { LiquidBackground } from "../components/LiquidBackground";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Platform, View } from "react-native";
import Purchases from "react-native-purchases";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { TrackerProvider } from "../context/TrackerContext";
import { initPushNotifications } from "../services/pushService";

function AppContent() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const setupNotifications = async () => {
      if (user) {
        unsubscribe = await initPushNotifications(user.uid, (path) => {
          router.push(path as any);
        });
      }
    };
    setupNotifications();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#000" },
          animation: "fade",
        }}
      >
        {/* Ensure index is explicitly defined */}
        <Stack.Screen name="index" options={{ title: 'Onboarding' }} />
        {/* Uncommented (tabs) to let the router know this group exists */}
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      </Stack>
    </View>
  );
}

let isServicesInitialized = false;

export default function RootLayout() {
  useEffect(() => {
    if (isServicesInitialized) return;
    isServicesInitialized = true;

    const initServices = async () => {
      try {
        const rcKey = Platform.OS === "ios" 
          ? "appl_VaWLLyYXCEMahgcYiyancmvRFfe" 
          : "goog_qVyMZdgdTHmyHYlrpbVNoQHaFPL";
          
        await Purchases.configure({ apiKey: rcKey });
        if (__DEV__) Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      } catch (e) {
        console.warn("RevenueCat Init Warning:", e);
      }

      try {
        const appCheck = firebaseNative.appCheck();
        const rnfbProvider = appCheck.newReactNativeFirebaseAppCheckProvider();
        rnfbProvider.configure({
          android: { provider: "debug", debugToken: "59ad6d32-2d93-4e4b-8533-317676773344" },
          apple: { provider: "debug", debugToken: "59ad6d32-2d93-4e4b-8533-317676773344" },
        });
        await appCheck.initializeAppCheck({ provider: rnfbProvider, isTokenAutoRefreshEnabled: true });
        if (__DEV__) console.log("✅ App Check Activated!");
      } catch (e) {
        console.error("❌ App Check Init Failed:", e);
      }
    };

    initServices();
  }, []);

  return (
    <LiquidBackground>
      <AuthProvider>
        <LanguageProvider>
          <TrackerProvider>
            <AppContent />
          </TrackerProvider>
        </LanguageProvider>
      </AuthProvider>
    </LiquidBackground>
  );
}