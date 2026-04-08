import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { initializeUser } from "../services/database";
import { auth } from "../services/firebase";

export default function AppleSignIn() {
  const router = useRouter();

  if (Platform.OS !== "ios") return null;

  const handleAppleLogin = async () => {
    try {
      // 1. Generate Nonce for Firebase Security
      const nonce =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
      );

      // 2. Trigger the Native Auth Request
      const appleResult = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken, email } = appleResult;
      if (!identityToken) throw new Error("No identity token provided.");

      // 3. Authenticate with Firebase
      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      const userCredential = await auth().signInWithCredential(appleCredential);
      const user = userCredential.user;

      if (user) {
        let safeEmail = email || user.email || "";
        await initializeUser(user.uid, safeEmail);
        console.log("Apple User Initialized with Custom Button.");
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED" || e.code === "ERR_CANCELED") return;
      
      console.error("Apple Sign-In Error:", e);
      Alert.alert("Login Failed", e.message || "Could not complete Apple Sign-In.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.customButton} 
        onPress={handleAppleLogin}
        activeOpacity={0.8}
      >
        <Ionicons name="logo-apple" size={20} color="#000" style={styles.icon} />
        <Text style={styles.buttonText}>Continue with Apple</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  customButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF", // Solid White background for high contrast on dark theme
    width: "100%",
    height: 52,
    borderRadius: 24, // Your requested border radius
    alignItems: "center",
    justifyContent: "center",
    // Adding a slight shadow to make it clearly "elevated" as a button
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
    marginTop: -2, // Slight adjustment to center the Apple logo visually
  },
  buttonText: {
    color: "#000000",
    fontSize: 17, // Set this to match your Google/Email buttons exactly
    fontWeight: "600",
    letterSpacing: -0.4,
  },
});