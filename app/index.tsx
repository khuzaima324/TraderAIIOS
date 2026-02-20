// import { Logo } from "../components/Logo";
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Dimensions,
//   Easing,
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import AppleSignIn from "../components/AppleSignIn";
// import {
//   GlassBox,
//   GlassButton,
//   GlassCard,
//   GlassInput,
// } from "../components/GlassComponents";
// import {
//   auth,
//   getFriendlyErrorMessage,
//   loginWithEmail,
//   loginWithGoogle,
//   logoutUser,
//   resendVerificationEmail,
//   resetPassword,
//   signUpWithEmail,
// } from "../services/firebase";
// import {
//   playHapticClick,
//   playScanStart,
//   playSuccessSound,
// } from "../services/soundService";

// const { height } = Dimensions.get("window");
// const BRAND_BLUE = "rgb(10, 132, 255)";
// const NEON_ORANGE = "#FF9500";

// const RadarAnimation = () => {
//   const spinValue = useRef(new Animated.Value(0)).current;
//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(spinValue, {
//         toValue: 1,
//         duration: 3000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       }),
//     ).start();
//   }, []);
//   const spin = spinValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });
//   return (
//     <View style={styles.animContainer}>
//       <View
//         style={[styles.radarCircle, { width: 40, height: 40, opacity: 0.8 }]}
//       />
//       <View
//         style={[styles.radarCircle, { width: 70, height: 70, opacity: 0.5 }]}
//       />
//       <View
//         style={[styles.radarCircle, { width: 100, height: 100, opacity: 0.3 }]}
//       />
//       <Animated.View
//         style={[
//           styles.radarSweep,
//           { width: 100, height: 100, transform: [{ rotate: spin }] },
//         ]}
//       >
//         <LinearGradient
//           colors={[BRAND_BLUE, "transparent"]}
//           start={{ x: 0, y: 0.5 }}
//           end={{ x: 1, y: 0.5 }}
//           style={styles.sweepGradient}
//         />
//       </Animated.View>
//       <View style={styles.radarDot} />
//     </View>
//   );
// };

// const SignalAnimation = () => {
//   const scale1 = useRef(new Animated.Value(1)).current;
//   const opacity1 = useRef(new Animated.Value(1)).current;
//   const scale2 = useRef(new Animated.Value(1)).current;
//   const opacity2 = useRef(new Animated.Value(1)).current;
//   useEffect(() => {
//     const animateRipple = (
//       scale: Animated.Value,
//       opacity: Animated.Value,
//       delay: number,
//     ) => {
//       Animated.loop(
//         Animated.sequence([
//           Animated.delay(delay),
//           Animated.parallel([
//             Animated.timing(scale, {
//               toValue: 2.5,
//               duration: 2000,
//               useNativeDriver: true,
//             }),
//             Animated.timing(opacity, {
//               toValue: 0,
//               duration: 2000,
//               useNativeDriver: true,
//             }),
//           ]),
//           Animated.parallel([
//             Animated.timing(scale, {
//               toValue: 1,
//               duration: 0,
//               useNativeDriver: true,
//             }),
//             Animated.timing(opacity, {
//               toValue: 1,
//               duration: 0,
//               useNativeDriver: true,
//             }),
//           ]),
//         ]),
//       ).start();
//     };
//     animateRipple(scale1, opacity1, 0);
//     animateRipple(scale2, opacity2, 1000);
//   }, []);
//   return (
//     <View style={styles.animContainer}>
//       <Animated.View
//         style={[
//           styles.rippleCircle,
//           {
//             width: 70,
//             height: 70,
//             borderRadius: 35,
//             transform: [{ scale: scale1 }],
//             opacity: opacity1,
//           },
//         ]}
//       />
//       <Animated.View
//         style={[
//           styles.rippleCircle,
//           {
//             width: 70,
//             height: 70,
//             borderRadius: 35,
//             transform: [{ scale: scale2 }],
//             opacity: opacity2,
//           },
//         ]}
//       />
//       <View
//         style={[
//           styles.signalIconBox,
//           { width: 40, height: 40, borderRadius: 20 },
//         ]}
//       >
//         <Ionicons name="flash" size={20} color="#30D158" />
//       </View>
//     </View>
//   );
// };

// const ScannerAnimation = () => {
//   const translateY = useRef(new Animated.Value(-30)).current;
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(translateY, {
//           toValue: 30,
//           duration: 1500,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//         Animated.timing(translateY, {
//           toValue: -30,
//           duration: 1500,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//       ]),
//     ).start();
//   }, []);
//   return (
//     <View style={styles.animContainer}>
//       <View style={styles.candlesRow}>
//         <View
//           style={[
//             styles.candle,
//             { height: 20, backgroundColor: "#BF5AF2", opacity: 0.5 },
//           ]}
//         />
//         <View
//           style={[
//             styles.candle,
//             { height: 40, backgroundColor: "#BF5AF2", opacity: 1.0 },
//           ]}
//         />
//         <View
//           style={[
//             styles.candle,
//             { height: 15, backgroundColor: "#BF5AF2", opacity: 0.5 },
//           ]}
//         />
//         <View
//           style={[
//             styles.candle,
//             { height: 35, backgroundColor: "#BF5AF2", opacity: 1.0 },
//           ]}
//         />
//       </View>
//       <View style={[styles.bracket, styles.bracketTL]} />
//       <View style={[styles.bracket, styles.bracketTR]} />
//       <View style={[styles.bracket, styles.bracketBL]} />
//       <View style={[styles.bracket, styles.bracketBR]} />
//       <Animated.View
//         style={[styles.laserLine, { transform: [{ translateY }] }]}
//       >
//         <LinearGradient
//           colors={["transparent", "#BF5AF2", "transparent"]}
//           start={{ x: 0, y: 0 }}
//           end={{ x: 1, y: 0 }}
//           style={{ flex: 1 }}
//         />
//       </Animated.View>
//     </View>
//   );
// };

// type ViewState =
//   | "WALKTHROUGH"
//   | "LANDING"
//   | "LOGIN_EMAIL"
//   | "SIGNUP_EMAIL"
//   | "FORGOT_PASSWORD"
//   | "VERIFY_PROMPT";

// export default function OnboardingScreen() {
//   const router = useRouter();
//   const [view, setView] = useState<ViewState>("WALKTHROUGH");
//   const [isLoading, setIsLoading] = useState(false);

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMsg, setSuccessMsg] = useState<string | null>(null);
//   const [slideIndex, setSlideIndex] = useState(0);

//   const slides = [
//     {
//       id: "tracker",
//       title: "Smart Tracker",
//       subtitle: "Monitor Market Movers",
//       desc: "Track influential figures like Elon Musk, Trump, or top analysts. Our AI monitors their activity 24/7.",
//       color: BRAND_BLUE,
//     },
//     {
//       id: "signals",
//       title: "Instant Signals",
//       subtitle: "Turn Tweets into Trades",
//       desc: "The Signaler engine instantly analyzes social sentiment and generates complete trade setups.",
//       color: "#30D158",
//     },
//     {
//       id: "analyzer",
//       title: "AI Analyzer",
//       subtitle: "Institutional Grade Insight",
//       desc: "Upload or take a photo of any trading chart screen. Our advanced AI identifies market structure.",
//       color: "#BF5AF2",
//     },
//   ];

//   // 👇 AUTH STATE OBSERVER
//   useEffect(() => {
//     // ✅ FIXED: auth() instead of auth
//     const unsubscribe = auth().onAuthStateChanged(async (user) => {
//       if (user) {
//         await user.reload();
//         if (user.emailVerified) {
//           router.replace("/(tabs)/analyzer");
//         } else {
//           setView("VERIFY_PROMPT");
//           setEmail(user.email || "");
//         }
//       }
//     });
//     return unsubscribe;
//   }, []);

//   useEffect(() => {
//     setError(null);
//     setSuccessMsg(null);
//     setShowPassword(false);
//   }, [view]);

//   const handleCheckVerification = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       // ✅ FIXED: auth().currentUser
//       const user = auth().currentUser;
//       if (user) {
//         await user.reload();
//         if (user.emailVerified) {
//           playSuccessSound();
//           router.replace("/(tabs)/analyzer");
//         } else {
//           Alert.alert(
//             "Pending Verification",
//             "Please click the link in your email first.",
//           );
//         }
//       }
//     } catch (e: any) {
//       setError(getFriendlyErrorMessage(e));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogin = async () => {
//     if (!email || !password) return setError("Please fill all fields");
//     setIsLoading(true);
//     setError(null);
//     try {
//       await loginWithEmail(email, password);
//     } catch (e: any) {
//       setError(getFriendlyErrorMessage(e));
//       setIsLoading(false);
//     }
//   };

//   const handleSignup = async () => {
//     if (!email.includes("@") || password.length < 6)
//       return setError("Invalid email or password (min 6 chars)");
//     setIsLoading(true);
//     setError(null);
//     try {
//       await signUpWithEmail(email, password);
//     } catch (e: any) {
//       setError(getFriendlyErrorMessage(e));
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await loginWithGoogle();
//     } catch (e: any) {
//       setError(getFriendlyErrorMessage(e));
//       setIsLoading(false);
//     }
//   };

//   const handleReset = async () => {
//     if (!email) return setError("Enter your email address");
//     setIsLoading(true);
//     try {
//       await resetPassword(email);
//       setSuccessMsg("Reset link sent! Check your email.");
//       setTimeout(() => setView("LOGIN_EMAIL"), 3000);
//     } catch (e: any) {
//       setError(getFriendlyErrorMessage(e));
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     // ✅ FIXED: auth().currentUser
//     const user = auth().currentUser;
//     if (user) {
//       playScanStart();
//       setIsLoading(true);
//       try {
//         await resendVerificationEmail(user);
//         playSuccessSound();
//         Alert.alert("Sent!", "A new verification link has been sent.");
//       } catch (e: any) {
//         setError(getFriendlyErrorMessage(e));
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const LogoHeader = ({ scale = 1 }: { scale?: number }) => (
//     <View style={[styles.logoContainer, { transform: [{ scale }] }]}>
//       {/* <Logo size={46} color={BRAND_BLUE} style={{ marginBottom: 20 }} /> */}
//       <Image
//         source={require("../assets/images/new-icon.png")}
//         style={styles.logoImage}
//         resizeMethod="contain"
//       />
//       <Text style={styles.appTitle}>Traders AI</Text>
//       <Text style={styles.appSubtitle}>Institutional Grade Analysis</Text>
//     </View>
//   );

//   const renderWalkthrough = () => (
//     <View style={styles.walkthroughContainer}>
//       <View style={styles.slideContent}>
//         <View style={styles.animationBox}>
//           <View style={styles.gridDots}>
//             {Array.from({ length: 25 }).map((_, i) => (
//               <View key={i} style={styles.dotGrid} />
//             ))}
//           </View>
//           {slideIndex === 0 && <RadarAnimation />}
//           {slideIndex === 1 && <SignalAnimation />}
//           {slideIndex === 2 && <ScannerAnimation />}
//         </View>
//         <Text style={styles.slideTitle}>{slides[slideIndex].title}</Text>
//         <Text
//           style={[styles.slideSubtitle, { color: slides[slideIndex].color }]}
//         >
//           {slides[slideIndex].subtitle}
//         </Text>
//         <Text style={styles.slideDesc}>{slides[slideIndex].desc}</Text>
//         <View style={styles.dotsContainer}>
//           {slides.map((_, idx) => (
//             <View
//               key={idx}
//               style={[
//                 styles.dot,
//                 idx === slideIndex
//                   ? { backgroundColor: slides[slideIndex].color, width: 32 }
//                   : { backgroundColor: "#333", width: 8 },
//               ]}
//             />
//           ))}
//         </View>
//       </View>
//       <View style={styles.bottomButtonContainer}>
//         <GlassButton
//           onPress={() => {
//             playHapticClick();
//             slideIndex < slides.length - 1
//               ? setSlideIndex((i) => i + 1)
//               : setView("LANDING");
//           }}
//           variant="primary"
//           style={{ borderRadius: 35 }}
//         >
//           {slideIndex === slides.length - 1 ? "Get Started" : "Next"}
//         </GlassButton>
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         style={{ flex: 1 }}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}
//           bounces={false}
//           keyboardShouldPersistTaps="handled"
//           scrollEnabled={view !== "VERIFY_PROMPT"}
//         >
//           {view !== "WALKTHROUGH" && (
//             <LogoHeader scale={view === "LANDING" ? 1 : 0.8} />
//           )}

//           {view === "LANDING" && (
//             <View style={styles.landingContainer}>
//               <AppleSignIn />

//               <TouchableOpacity
//                 onPress={() => {
//                   (handleGoogleLogin(), playHapticClick());
//                 }}
//                 style={styles.btnDark}
//                 activeOpacity={0.8}
//               >
//                 <Image
//                   source={require("../assets/images/google.png")}
//                   style={{ width: 20, height: 20, marginRight: 10 }}
//                   resizeMode="contain"
//                 />
//                 <Text style={styles.textWhite}>Continue with Google</Text>
//               </TouchableOpacity>

//               <View style={styles.dividerContainer}>
//                 <View style={styles.dividerLine} />
//                 <Text style={styles.dividerText}>OR</Text>
//                 <View style={styles.dividerLine} />
//               </View>

//               <TouchableOpacity
//                 onPress={() => {
//                   (setView("LOGIN_EMAIL"), playHapticClick());
//                 }}
//                 style={styles.btnOutline}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.textBlue}>Sign in with Email</Text>
//               </TouchableOpacity>

//               <View style={styles.footerRow}>
//                 <Text style={{ color: "rgba(255,255,255,0.4)" }}>
//                   Don't have an account?{" "}
//                 </Text>
//                 <TouchableOpacity onPress={() => setView("SIGNUP_EMAIL")}>
//                   <Text style={{ color: "#fff", fontWeight: "bold" }}>
//                     Create one
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           )}

//           {view === "WALKTHROUGH" && renderWalkthrough()}

//           {(view === "LOGIN_EMAIL" || view === "SIGNUP_EMAIL") && (
//             <GlassCard style={{ backgroundColor: "rgba(20, 20, 25, 0)" }}>
//               <Text style={styles.headerTitle}>
//                 {view === "LOGIN_EMAIL" ? "Welcome Back" : "Create Account"}
//               </Text>
//               {error && <Text style={styles.errorText}>{error}</Text>}
//               {successMsg && (
//                 <Text style={styles.successText}>{successMsg}</Text>
//               )}

//               <Text style={styles.label}>EMAIL</Text>
//               <GlassInput
//                 iconName="mail-outline"
//                 value={email}
//                 onChangeText={setEmail}
//                 placeholder="name@example.com"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//               />

//               <Text style={styles.label}>PASSWORD</Text>
//               <GlassInput
//                 iconName="lock-closed-outline"
//                 value={password}
//                 onChangeText={setPassword}
//                 placeholder="••••••••"
//                 secureTextEntry={!showPassword}
//                 rightElement={
//                   <TouchableOpacity
//                     onPress={() => {
//                       playHapticClick();
//                       setShowPassword(!showPassword);
//                     }}
//                   >
//                     <Ionicons
//                       name={showPassword ? "eye-off-outline" : "eye-outline"}
//                       size={20}
//                       color="rgba(255,255,255,0.5)"
//                     />
//                   </TouchableOpacity>
//                 }
//               />
//               {view === "LOGIN_EMAIL" && (
//                 <TouchableOpacity
//                   onPress={() => setView("FORGOT_PASSWORD")}
//                   style={{ alignSelf: "flex-end", marginVertical: 12 }}
//                 >
//                   <Text style={styles.forgotPassText}>Forgot Password?</Text>
//                 </TouchableOpacity>
//               )}
//               <GlassButton
//                 onPress={view === "LOGIN_EMAIL" ? handleLogin : handleSignup}
//                 isLoading={isLoading}
//                 variant="primary"
//                 style={{
//                   marginTop: view === "SIGNUP_EMAIL" ? 24 : 0,
//                   borderRadius: 35,
//                 }}
//               >
//                 {view === "LOGIN_EMAIL" ? "Sign In" : "Create Account"}
//               </GlassButton>
//               <TouchableOpacity
//                 onPress={() => setView("LANDING")}
//                 style={styles.cancelBtn}
//               >
//                 <Text style={styles.cancelText}>Cancel</Text>
//               </TouchableOpacity>
//             </GlassCard>
//           )}

//           {view === "FORGOT_PASSWORD" && (
//             <GlassCard>
//               <Ionicons
//                 name="key-outline"
//                 size={48}
//                 color={BRAND_BLUE}
//                 style={{ alignSelf: "center", marginBottom: 16 }}
//               />
//               <Text style={styles.headerTitle}>Reset Password</Text>
//               <Text style={styles.bodyText}>
//                 Enter email to receive reset link.
//               </Text>
//               <GlassInput
//                 iconName="mail-outline"
//                 value={email}
//                 onChangeText={setEmail}
//                 placeholder="name@example.com"
//               />
//               <GlassButton
//                 onPress={handleReset}
//                 isLoading={isLoading}
//                 style={{ marginTop: 16, borderRadius: 36 }}
//                 variant="primary"
//               >
//                 Send Link
//               </GlassButton>
//               <TouchableOpacity
//                 onPress={() => setView("LOGIN_EMAIL")}
//                 style={styles.cancelBtn}
//               >
//                 <Text style={styles.cancelText}>Back to Login</Text>
//               </TouchableOpacity>
//             </GlassCard>
//           )}

//           {view === "VERIFY_PROMPT" && (
//             <GlassBox style={styles.verificationOverlay}>
//               <View style={styles.verifyIconContainer}>
//                 <Ionicons name="mail-open" size={32} color={NEON_ORANGE} />
//               </View>
//               <Text style={styles.verifyTitle}>Check your Inbox</Text>
//               <Text style={styles.verifyText}>
//                 We've sent a verification link to{"\n"}
//                 <Text style={styles.verifyEmail}>{email}</Text>.{"\n\n"}Please
//                 verify your email to continue.
//               </Text>
//               {error && (
//                 <Text
//                   style={[
//                     styles.errorText,
//                     {
//                       color: NEON_ORANGE,
//                       backgroundColor: "rgba(255, 149, 0, 0.1)",
//                     },
//                   ]}
//                 >
//                   {error}
//                 </Text>
//               )}
//               <GlassButton
//                 onPress={handleCheckVerification}
//                 isLoading={isLoading}
//                 variant="secondary"
//                 style={{
//                   marginTop: 8,
//                   backgroundColor: "rgba(255, 255, 255, 0.1)",
//                   borderColor: "rgba(10, 132, 255, 0.5)",
//                   borderWidth: 1,
//                   borderRadius: 36,
//                   paddingHorizontal: 54,
//                 }}
//               >
//                 I've Verified My Email
//               </GlassButton>
//               <TouchableOpacity
//                 onPress={handleResend}
//                 disabled={isLoading}
//                 style={{ marginTop: 18, alignItems: "center" }}
//               >
//                 <Text style={[styles.linkTextBlue]}>
//                   Resend Verification Link
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={async () => {
//                   await logoutUser();
//                   setView("LOGIN_EMAIL");
//                 }}
//                 style={styles.cancelBtn}
//               >
//                 <Text style={styles.verifyBack}>Back to Login</Text>
//               </TouchableOpacity>
//             </GlassBox>
//           )}

//           {view !== "WALKTHROUGH" && (
//             <Text style={styles.footerText}>
//               By continuing you agree to our Terms of Service{"\n"}and Privacy
//               Policy.
//             </Text>
//           )}
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#000000" },
//   scrollContent: {
//     flexGrow: 1,
//     padding: 24,
//     justifyContent: "center",
//   },
//   logoContainer: { alignItems: "center", marginBottom: 30, marginTop: 40 },
//   logoImage: { width: 100, height: 100, marginBottom: 16 },
//   appTitle: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#fff",
//     letterSpacing: 0.5,
//   },
//   appSubtitle: {
//     fontSize: 14,
//     color: "rgba(255,255,255,0.5)",
//     marginTop: 4,
//     fontWeight: "500",
//   },
//   landingContainer: { width: "100%", gap: 12 },
//   btnWhite: {
//     width: "100%",
//     height: 52,
//     backgroundColor: "#fff",
//     borderRadius: 30,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   btnDark: {
//     width: "100%",
//     height: 52,
//     backgroundColor: "#1C1C1E",
//     borderRadius: 30,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "#333",
//   },
//   btnOutline: {
//     width: "100%",
//     height: 52,
//     backgroundColor: "rgba(10, 132, 255, 0.08)",
//     borderRadius: 30,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1.5,
//     borderColor: BRAND_BLUE,
//   },
//   textBlack: { color: "#000", fontSize: 16, fontWeight: "600" },
//   textWhite: { color: "#fff", fontSize: 16, fontWeight: "600" },
//   textBlue: { color: BRAND_BLUE, fontSize: 16, fontWeight: "600" },
//   dividerContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginVertical: 20,
//   },
//   dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },
//   dividerText: {
//     marginHorizontal: 16,
//     color: "rgba(255,255,255,0.3)",
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
//   walkthroughContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   slideContent: { alignItems: "center", width: "100%" },
//   animationBox: {
//     width: 220,
//     height: 220,
//     borderRadius: 26,
//     backgroundColor: "rgba(22, 22, 24, 0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 40,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//     overflow: "hidden",
//   },
//   gridDots: {
//     ...StyleSheet.absoluteFillObject,
//     flexDirection: "row",
//     flexWrap: "wrap",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//     opacity: 0.15,
//   },
//   dotGrid: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#fff",
//     margin: 15,
//   },
//   animContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     width: "100%",
//     height: "100%",
//   },
//   radarCircle: {
//     position: "absolute",
//     borderWidth: 1,
//     borderColor: BRAND_BLUE,
//     borderRadius: 100,
//   },
//   radarSweep: {
//     width: 140,
//     height: 140,
//     position: "absolute",
//     justifyContent: "center",
//   },
//   sweepGradient: {
//     width: "50%",
//     height: 2,
//     alignSelf: "flex-end",
//     opacity: 0.8,
//   },
//   radarDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
//   rippleCircle: {
//     position: "absolute",
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 2,
//     borderColor: "#30D158",
//   },
//   signalIconBox: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "rgba(48, 209, 88, 0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#30D158",
//   },
//   candlesRow: {
//     flexDirection: "row",
//     alignItems: "flex-end",
//     gap: 6,
//     opacity: 0.5,
//   },
//   candle: { width: 8, borderRadius: 2 },
//   bracket: {
//     position: "absolute",
//     width: 15,
//     height: 15,
//     borderColor: "#BF5AF2",
//     borderWidth: 2,
//   },
//   bracketTL: { top: 45, left: 45, borderRightWidth: 0, borderBottomWidth: 0 },
//   bracketTR: { top: 45, right: 45, borderLeftWidth: 0, borderBottomWidth: 0 },
//   bracketBL: { bottom: 45, left: 45, borderRightWidth: 0, borderTopWidth: 0 },
//   bracketBR: { bottom: 45, right: 45, borderLeftWidth: 0, borderTopWidth: 0 },
//   laserLine: { position: "absolute", width: 110, height: 2, zIndex: 10 },
//   slideTitle: {
//     fontSize: 32,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   slideSubtitle: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: BRAND_BLUE,
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   slideDesc: {
//     fontSize: 15,
//     color: "rgba(255,255,255,0.6)",
//     textAlign: "center",
//     marginBottom: 40,
//     lineHeight: 22,
//     maxWidth: "90%",
//   },
//   dotsContainer: {
//     flexDirection: "row",
//     marginBottom: 40,
//     height: 8,
//     alignItems: "center",
//   },
//   dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
//   bottomButtonContainer: {
//     width: "100%",
//     paddingHorizontal: 0,
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 24,
//     textAlign: "center",
//   },
//   label: {
//     color: "rgba(255,255,255,0.5)",
//     fontSize: 11,
//     fontWeight: "700",
//     marginBottom: 8,
//     marginLeft: 4,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   forgotPassText: { color: BRAND_BLUE, fontSize: 14, fontWeight: "500" },
//   cancelBtn: { marginTop: 20, padding: 10, alignItems: "center" },
//   cancelText: {
//     color: "rgba(255,255,255,0.5)",
//     fontSize: 15,
//     fontWeight: "500",
//   },
//   bodyText: {
//     color: "rgba(255,255,255,0.7)",
//     textAlign: "center",
//     lineHeight: 20,
//     fontSize: 14,
//     marginBottom: 24,
//   },
//   errorText: {
//     color: "#FF453A",
//     textAlign: "center",
//     marginBottom: 16,
//     backgroundColor: "rgba(255, 69, 58, 0.1)",
//     padding: 10,
//     borderRadius: 8,
//     overflow: "hidden",
//   },
//   successText: { color: "#30D158", textAlign: "center", marginBottom: 16 },
//   linkTextBlue: {
//     color: BRAND_BLUE,
//     fontSize: 14,
//     fontWeight: "600",
//     textAlign: "center",
//   },
//   footerText: {
//     marginTop: 40,
//     textAlign: "center",
//     color: "rgba(255,255,255,0.25)",
//     fontSize: 11,
//     lineHeight: 16,
//   },
//   verificationOverlay: {
//     backgroundColor: "rgba(20, 20, 25, 0.95)",
//     borderColor: "rgba(255, 149, 0, 0.15)",
//     borderWidth: 1,
//     padding: 18,
//     borderRadius: 24,
//     alignItems: "center",
//   },
//   verifyIconContainer: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "rgba(255, 149, 0, 0.1)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   verifyTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#fff",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   verifyText: {
//     fontSize: 14,
//     fontWeight: "400",
//     color: "rgba(255,255,255,0.7)",
//     marginBottom: 24,
//     textAlign: "center",
//     lineHeight: 22,
//   },
//   verifyEmail: {
//     fontWeight: "700",
//     color: "#fff",
//   },
//   verifyBack: {
//     color: "rgba(255,255,255,0.3)",
//     fontSize: 13,
//     fontWeight: "500",
//   },
// });


import { Logo } from "../components/Logo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AppleSignIn from "../components/AppleSignIn";
import {
  GlassBox,
  GlassButton,
  GlassCard,
  GlassInput,
} from "../components/GlassComponents";
import {
  auth,
  getFriendlyErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  resendVerificationEmail,
  resetPassword,
  signUpWithEmail,
} from "../services/firebase";
import {
  playHapticClick,
  playScanStart,
  playSuccessSound,
} from "../services/soundService";

const { height } = Dimensions.get("window");
const BRAND_BLUE = "rgb(10, 132, 255)";
const NEON_ORANGE = "#FF9500";

const RadarAnimation = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  return (
    <View style={styles.animContainer}>
      <View
        style={[styles.radarCircle, { width: 40, height: 40, opacity: 0.8 }]}
      />
      <View
        style={[styles.radarCircle, { width: 70, height: 70, opacity: 0.5 }]}
      />
      <View
        style={[styles.radarCircle, { width: 100, height: 100, opacity: 0.3 }]}
      />
      <Animated.View
        style={[
          styles.radarSweep,
          { width: 100, height: 100, transform: [{ rotate: spin }] },
        ]}
      >
        <LinearGradient
          colors={[BRAND_BLUE, "transparent"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.sweepGradient}
        />
      </Animated.View>
      <View style={styles.radarDot} />
    </View>
  );
};

const SignalAnimation = () => {
  const scale1 = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const opacity2 = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const animateRipple = (
      scale: Animated.Value,
      opacity: Animated.Value,
      delay: number,
    ) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 2.5,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scale, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 1,
              duration: 0,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };
    animateRipple(scale1, opacity1, 0);
    animateRipple(scale2, opacity2, 1000);
  }, []);
  return (
    <View style={styles.animContainer}>
      <Animated.View
        style={[
          styles.rippleCircle,
          {
            width: 70,
            height: 70,
            borderRadius: 35,
            transform: [{ scale: scale1 }],
            opacity: opacity1,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.rippleCircle,
          {
            width: 70,
            height: 70,
            borderRadius: 35,
            transform: [{ scale: scale2 }],
            opacity: opacity2,
          },
        ]}
      />
      <View
        style={[
          styles.signalIconBox,
          { width: 40, height: 40, borderRadius: 20 },
        ]}
      >
        <Ionicons name="flash" size={20} color="#30D158" />
      </View>
    </View>
  );
};

const ScannerAnimation = () => {
  const translateY = useRef(new Animated.Value(-30)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 30,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -30,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);
  return (
    <View style={styles.animContainer}>
      <View style={styles.candlesRow}>
        <View
          style={[
            styles.candle,
            { height: 20, backgroundColor: "#BF5AF2", opacity: 0.5 },
          ]}
        />
        <View
          style={[
            styles.candle,
            { height: 40, backgroundColor: "#BF5AF2", opacity: 1.0 },
          ]}
        />
        <View
          style={[
            styles.candle,
            { height: 15, backgroundColor: "#BF5AF2", opacity: 0.5 },
          ]}
        />
        <View
          style={[
            styles.candle,
            { height: 35, backgroundColor: "#BF5AF2", opacity: 1.0 },
          ]}
        />
      </View>
      <View style={[styles.bracket, styles.bracketTL]} />
      <View style={[styles.bracket, styles.bracketTR]} />
      <View style={[styles.bracket, styles.bracketBL]} />
      <View style={[styles.bracket, styles.bracketBR]} />
      <Animated.View
        style={[styles.laserLine, { transform: [{ translateY }] }]}
      >
        <LinearGradient
          colors={["transparent", "#BF5AF2", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

type ViewState =
  | "WALKTHROUGH"
  | "LANDING"
  | "LOGIN_EMAIL"
  | "SIGNUP_EMAIL"
  | "FORGOT_PASSWORD"
  | "VERIFY_PROMPT";

export default function OnboardingScreen() {
  const router = useRouter();
  const [view, setView] = useState<ViewState>("WALKTHROUGH");
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      id: "tracker",
      title: "Smart Tracker",
      subtitle: "Monitor Market Movers",
      desc: "Track influential figures like Elon Musk, Trump, or top analysts. Our AI monitors their activity 24/7.",
      color: BRAND_BLUE,
    },
    {
      id: "signals",
      title: "Instant Signals",
      subtitle: "Turn Tweets into Trades",
      desc: "The Signaler engine instantly analyzes social sentiment and generates complete trade setups.",
      color: "#30D158",
    },
    {
      id: "analyzer",
      title: "AI Analyzer",
      subtitle: "Institutional Grade Insight",
      desc: "Upload or take a photo of any trading chart screen. Our advanced AI identifies market structure.",
      color: "#BF5AF2",
    },
  ];

  // 👇 AUTH STATE OBSERVER
  useEffect(() => {
    // FIX 1: Removed async and dangerous user.reload() to prevent infinite loop
    const unsubscribe = auth().onAuthStateChanged((user) => {
      if (user) {
        if (user.emailVerified) {
          router.replace("/(tabs)/analyzer");
        } else {
          setView("VERIFY_PROMPT");
          setEmail(user.email || "");
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    setError(null);
    setSuccessMsg(null);
    setShowPassword(false);
  }, [view]);

  const handleCheckVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = auth().currentUser;
      if (user) {
        await user.reload();
        // FIX 2: Force Firebase to refresh token so it catches the verification
        await user.getIdToken(true); 
        
        if (auth().currentUser?.emailVerified) { // Re-check after forcing refresh
          playSuccessSound();
          router.replace("/(tabs)/analyzer");
        } else {
          Alert.alert(
            "Pending Verification",
            "Please click the link in your email first. If you don't see it, check your spam folder.",
          );
        }
      }
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return setError("Please fill all fields");
    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      // FIX 3: Always turn off spinner
      setIsLoading(false); 
    }
  };

  const handleSignup = async () => {
    if (!email.includes("@") || password.length < 6)
      return setError("Invalid email or password (min 6 chars)");
    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password);
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      // FIX 3: Always turn off spinner
      setIsLoading(false); 
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      // FIX 3: Always turn off spinner
      setIsLoading(false); 
    }
  };

  const handleReset = async () => {
    if (!email) return setError("Enter your email address");
    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccessMsg("Reset link sent! Check your email.");
      setTimeout(() => setView("LOGIN_EMAIL"), 3000);
    } catch (e: any) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const user = auth().currentUser;
    if (user) {
      playScanStart();
      setIsLoading(true);
      try {
        await resendVerificationEmail(user);
        playSuccessSound();
        Alert.alert("Sent!", "A new verification link has been sent.");
      } catch (e: any) {
        setError(getFriendlyErrorMessage(e));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const LogoHeader = ({ scale = 1 }: { scale?: number }) => (
    <View style={[styles.logoContainer, { transform: [{ scale }] }]}>
      <Image
        source={require("../assets/images/new-icon.png")}
        style={styles.logoImage}
        resizeMethod="contain"
      />
      <Text style={styles.appTitle}>Traders AI</Text>
      <Text style={styles.appSubtitle}>Institutional Grade Analysis</Text>
    </View>
  );

  const renderWalkthrough = () => (
    <View style={styles.walkthroughContainer}>
      <View style={styles.slideContent}>
        <View style={styles.animationBox}>
          <View style={styles.gridDots}>
            {Array.from({ length: 25 }).map((_, i) => (
              <View key={i} style={styles.dotGrid} />
            ))}
          </View>
          {slideIndex === 0 && <RadarAnimation />}
          {slideIndex === 1 && <SignalAnimation />}
          {slideIndex === 2 && <ScannerAnimation />}
        </View>
        <Text style={styles.slideTitle}>{slides[slideIndex].title}</Text>
        <Text
          style={[styles.slideSubtitle, { color: slides[slideIndex].color }]}
        >
          {slides[slideIndex].subtitle}
        </Text>
        <Text style={styles.slideDesc}>{slides[slideIndex].desc}</Text>
        <View style={styles.dotsContainer}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === slideIndex
                  ? { backgroundColor: slides[slideIndex].color, width: 32 }
                  : { backgroundColor: "#333", width: 8 },
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.bottomButtonContainer}>
        <GlassButton
          onPress={() => {
            playHapticClick();
            slideIndex < slides.length - 1
              ? setSlideIndex((i) => i + 1)
              : setView("LANDING");
          }}
          variant="primary"
          style={{ borderRadius: 35 }}
        >
          {slideIndex === slides.length - 1 ? "Get Started" : "Next"}
        </GlassButton>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={view !== "VERIFY_PROMPT"}
        >
          {view !== "WALKTHROUGH" && (
            <LogoHeader scale={view === "LANDING" ? 1 : 0.8} />
          )}

          {view === "LANDING" && (
            <View style={styles.landingContainer}>
              <AppleSignIn />

              <TouchableOpacity
                onPress={() => {
                  (handleGoogleLogin(), playHapticClick());
                }}
                style={styles.btnDark}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../assets/images/google.png")}
                  style={{ width: 20, height: 20, marginRight: 10 }}
                  resizeMode="contain"
                />
                <Text style={styles.textWhite}>Continue with Google</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                onPress={() => {
                  (setView("LOGIN_EMAIL"), playHapticClick());
                }}
                style={styles.btnOutline}
                activeOpacity={0.8}
              >
                <Text style={styles.textBlue}>Sign in with Email</Text>
              </TouchableOpacity>

              <View style={styles.footerRow}>
                <Text style={{ color: "rgba(255,255,255,0.4)" }}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity onPress={() => setView("SIGNUP_EMAIL")}>
                  <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    Create one
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {view === "WALKTHROUGH" && renderWalkthrough()}

          {(view === "LOGIN_EMAIL" || view === "SIGNUP_EMAIL") && (
            <GlassCard style={{ backgroundColor: "rgba(20, 20, 25, 0)" }}>
              <Text style={styles.headerTitle}>
                {view === "LOGIN_EMAIL" ? "Welcome Back" : "Create Account"}
              </Text>
              {error && <Text style={styles.errorText}>{error}</Text>}
              {successMsg && (
                <Text style={styles.successText}>{successMsg}</Text>
              )}

              <Text style={styles.label}>EMAIL</Text>
              <GlassInput
                iconName="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>PASSWORD</Text>
              <GlassInput
                iconName="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                rightElement={
                  <TouchableOpacity
                    onPress={() => {
                      playHapticClick();
                      setShowPassword(!showPassword);
                    }}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="rgba(255,255,255,0.5)"
                    />
                  </TouchableOpacity>
                }
              />
              {view === "LOGIN_EMAIL" && (
                <TouchableOpacity
                  onPress={() => setView("FORGOT_PASSWORD")}
                  style={{ alignSelf: "flex-end", marginVertical: 12 }}
                >
                  <Text style={styles.forgotPassText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}
              <GlassButton
                onPress={view === "LOGIN_EMAIL" ? handleLogin : handleSignup}
                isLoading={isLoading}
                variant="primary"
                style={{
                  marginTop: view === "SIGNUP_EMAIL" ? 24 : 0,
                  borderRadius: 35,
                }}
              >
                {view === "LOGIN_EMAIL" ? "Sign In" : "Create Account"}
              </GlassButton>
              <TouchableOpacity
                onPress={() => setView("LANDING")}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          {view === "FORGOT_PASSWORD" && (
            <GlassCard>
              <Ionicons
                name="key-outline"
                size={48}
                color={BRAND_BLUE}
                style={{ alignSelf: "center", marginBottom: 16 }}
              />
              <Text style={styles.headerTitle}>Reset Password</Text>
              <Text style={styles.bodyText}>
                Enter email to receive reset link.
              </Text>
              <GlassInput
                iconName="mail-outline"
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
              />
              <GlassButton
                onPress={handleReset}
                isLoading={isLoading}
                style={{ marginTop: 16, borderRadius: 36 }}
                variant="primary"
              >
                Send Link
              </GlassButton>
              <TouchableOpacity
                onPress={() => setView("LOGIN_EMAIL")}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Back to Login</Text>
              </TouchableOpacity>
            </GlassCard>
          )}

          {view === "VERIFY_PROMPT" && (
            <GlassBox style={styles.verificationOverlay}>
              <View style={styles.verifyIconContainer}>
                <Ionicons name="mail-open" size={32} color={NEON_ORANGE} />
              </View>
              <Text style={styles.verifyTitle}>Check your Inbox</Text>
              <Text style={styles.verifyText}>
                We've sent a verification link to{"\n"}
                <Text style={styles.verifyEmail}>{email}</Text>.{"\n\n"}Please
                verify your email to continue.
              </Text>
              {error && (
                <Text
                  style={[
                    styles.errorText,
                    {
                      color: NEON_ORANGE,
                      backgroundColor: "rgba(255, 149, 0, 0.1)",
                    },
                  ]}
                >
                  {error}
                </Text>
              )}
              <GlassButton
                onPress={handleCheckVerification}
                isLoading={isLoading}
                variant="secondary"
                style={{
                  marginTop: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "rgba(10, 132, 255, 0.5)",
                  borderWidth: 1,
                  borderRadius: 36,
                  paddingHorizontal: 54,
                }}
              >
                I've Verified My Email
              </GlassButton>
              <TouchableOpacity
                onPress={handleResend}
                disabled={isLoading}
                style={{ marginTop: 18, alignItems: "center" }}
              >
                <Text style={[styles.linkTextBlue]}>
                  Resend Verification Link
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  await logoutUser();
                  setView("LOGIN_EMAIL");
                }}
                style={styles.cancelBtn}
              >
                <Text style={styles.verifyBack}>Back to Login</Text>
              </TouchableOpacity>
            </GlassBox>
          )}

          {view !== "WALKTHROUGH" && (
            <Text style={styles.footerText}>
              By continuing you agree to our Terms of Service{"\n"}and Privacy
              Policy.
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  logoContainer: { alignItems: "center", marginBottom: 30, marginTop: 40 },
  logoImage: { width: 100, height: 100, marginBottom: 16 },
  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    marginTop: 4,
    fontWeight: "500",
  },
  landingContainer: { width: "100%", gap: 12 },
  btnWhite: {
    width: "100%",
    height: 52,
    backgroundColor: "#fff",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnDark: {
    width: "100%",
    height: 52,
    backgroundColor: "#1C1C1E",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  btnOutline: {
    width: "100%",
    height: 52,
    backgroundColor: "rgba(10, 132, 255, 0.08)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: BRAND_BLUE,
  },
  textBlack: { color: "#000", fontSize: 16, fontWeight: "600" },
  textWhite: { color: "#fff", fontSize: 16, fontWeight: "600" },
  textBlue: { color: BRAND_BLUE, fontSize: 16, fontWeight: "600" },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.1)" },
  dividerText: {
    marginHorizontal: 16,
    color: "rgba(255,255,255,0.3)",
    fontSize: 12,
    fontWeight: "600",
  },
  footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  walkthroughContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slideContent: { alignItems: "center", width: "100%" },
  animationBox: {
    width: 220,
    height: 220,
    borderRadius: 26,
    backgroundColor: "rgba(22, 22, 24, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  gridDots: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    opacity: 0.15,
  },
  dotGrid: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#fff",
    margin: 15,
  },
  animContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  radarCircle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: BRAND_BLUE,
    borderRadius: 100,
  },
  radarSweep: {
    width: 140,
    height: 140,
    position: "absolute",
    justifyContent: "center",
  },
  sweepGradient: {
    width: "50%",
    height: 2,
    alignSelf: "flex-end",
    opacity: 0.8,
  },
  radarDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  rippleCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#30D158",
  },
  signalIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(48, 209, 88, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30D158",
  },
  candlesRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    opacity: 0.5,
  },
  candle: { width: 8, borderRadius: 2 },
  bracket: {
    position: "absolute",
    width: 15,
    height: 15,
    borderColor: "#BF5AF2",
    borderWidth: 2,
  },
  bracketTL: { top: 45, left: 45, borderRightWidth: 0, borderBottomWidth: 0 },
  bracketTR: { top: 45, right: 45, borderLeftWidth: 0, borderBottomWidth: 0 },
  bracketBL: { bottom: 45, left: 45, borderRightWidth: 0, borderTopWidth: 0 },
  bracketBR: { bottom: 45, right: 45, borderLeftWidth: 0, borderTopWidth: 0 },
  laserLine: { position: "absolute", width: 110, height: 2, zIndex: 10 },
  slideTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  slideSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: BRAND_BLUE,
    marginBottom: 20,
    textAlign: "center",
  },
  slideDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
    maxWidth: "90%",
  },
  dotsContainer: {
    flexDirection: "row",
    marginBottom: 40,
    height: 8,
    alignItems: "center",
  },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  bottomButtonContainer: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  forgotPassText: { color: BRAND_BLUE, fontSize: 14, fontWeight: "500" },
  cancelBtn: { marginTop: 20, padding: 10, alignItems: "center" },
  cancelText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
    fontWeight: "500",
  },
  bodyText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    lineHeight: 20,
    fontSize: 14,
    marginBottom: 24,
  },
  errorText: {
    color: "#FF453A",
    textAlign: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255, 69, 58, 0.1)",
    padding: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  successText: { color: "#30D158", textAlign: "center", marginBottom: 16 },
  linkTextBlue: {
    color: BRAND_BLUE,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  footerText: {
    marginTop: 40,
    textAlign: "center",
    color: "rgba(255,255,255,0.25)",
    fontSize: 11,
    lineHeight: 16,
  },
  verificationOverlay: {
    backgroundColor: "rgba(20, 20, 25, 0.95)",
    borderColor: "rgba(255, 149, 0, 0.15)",
    borderWidth: 1,
    padding: 18,
    borderRadius: 24,
    alignItems: "center",
  },
  verifyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  verifyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  verifyText: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  verifyEmail: {
    fontWeight: "700",
    color: "#fff",
  },
  verifyBack: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
    fontWeight: "500",
  },
});