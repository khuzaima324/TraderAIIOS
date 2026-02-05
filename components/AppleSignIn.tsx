import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";
import { initializeUser } from "../services/database";
import { auth } from "../services/firebase";

export default function AppleSignIn() {
  const router = useRouter();

  if (Platform.OS !== "ios") return null;

  const handleAppleLogin = async () => {
    try {
      const nonce =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
      );

      const appleResult = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken } = appleResult;
      if (!identityToken) throw new Error("No identity token provided.");

      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      const userCredential = await auth().signInWithCredential(appleCredential);
      const user = userCredential.user;

      if (user) {
        await initializeUser(user.uid, user.email || "");
        console.log("Apple User Initialized in Database");
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
      } else {
        console.error("Apple Sign-In Error:", e);
        Alert.alert("Login Failed", e.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={30}
        style={styles.button}
        onPress={handleAppleLogin}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 52,
  },
});