// import * as AppleAuthentication from "expo-apple-authentication";
// import * as Crypto from "expo-crypto";
// import { useRouter } from "expo-router";
// import React from "react";
// import { Alert, Platform, StyleSheet, View } from "react-native";
// import { initializeUser } from "../services/database";
// import { auth } from "../services/firebase";

// export default function AppleSignIn() {
//   const router = useRouter();

//   if (Platform.OS !== "ios") return null;

//   const handleAppleLogin = async () => {
//     try {
//       const nonce =
//         Math.random().toString(36).substring(2, 15) +
//         Math.random().toString(36).substring(2, 15);
//       const hashedNonce = await Crypto.digestStringAsync(
//         Crypto.CryptoDigestAlgorithm.SHA256,
//         nonce,
//       );

//       const appleResult = await AppleAuthentication.signInAsync({
//         requestedScopes: [
//           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
//           AppleAuthentication.AppleAuthenticationScope.EMAIL,
//         ],
//         nonce: hashedNonce,
//       });

//       const { identityToken } = appleResult;
//       if (!identityToken) throw new Error("No identity token provided.");

//       const appleCredential = auth.AppleAuthProvider.credential(
//         identityToken,
//         nonce,
//       );

//       const userCredential = await auth().signInWithCredential(appleCredential);
//       const user = userCredential.user;

//       if (user) {
//         await initializeUser(user.uid, user.email || "");
//         console.log("Apple User Initialized in Database");
//       }
//     } catch (e: any) {
//       if (e.code === "ERR_REQUEST_CANCELED") {
//       } else {
//         console.error("Apple Sign-In Error:", e);
//         Alert.alert("Login Failed", e.message);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <AppleAuthentication.AppleAuthenticationButton
//         buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
//         buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
//         cornerRadius={30}
//         style={styles.button}
//         onPress={handleAppleLogin}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     marginBottom: 12,
//     width: "100%",
//     alignItems: "center",
//   },
//   button: {
//     width: "100%",
//     height: 52,
//   },
// });
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

      // 1. Extract email directly from the Apple result payload
      const { identityToken, email } = appleResult;
      if (!identityToken) throw new Error("No identity token provided.");

      const appleCredential = auth.AppleAuthProvider.credential(
        identityToken,
        nonce,
      );

      const userCredential = await auth().signInWithCredential(appleCredential);
      const user = userCredential.user;

      if (user) {
        // 2. CRASH FIX: Ensure email is strictly a string, never undefined.
        // Apple only returns the email on the very first login.
        let safeEmail = "";
        
        if (email) {
            safeEmail = email; 
        } else if (user.email) {
            safeEmail = user.email; 
        }

        if (safeEmail === undefined || safeEmail === null) {
            safeEmail = "";
        }

        await initializeUser(user.uid, safeEmail);
        console.log("Apple User Initialized safely.");
      }
    } catch (e: any) {
      // 3. RACE CONDITION FIX: Handle unmounts cleanly
      if (e.code === "ERR_REQUEST_CANCELED" || e.code === "ERR_CANCELED") {
        return; // User manually canceled
      }
      
      if (auth().currentUser) {
         // The auth listener already redirected the user. Safe to ignore background interrupt.
         console.log("Background task interrupted by screen navigation. Safe to ignore:", e.message);
         return; 
      }

      console.error("Apple Sign-In Error:", e);
      Alert.alert("Login Failed", e.message || "Could not complete Apple Sign-In.");
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