// import { Ionicons } from "@expo/vector-icons";
// import { BlurView } from "expo-blur";
// import { useRouter } from "expo-router";
// import React, { useRef } from "react";
// import {
//   ActivityIndicator,
//   Animated,
//   Dimensions,
//   Insets,
//   Modal,
//   Platform,
//   Pressable,
//   StyleProp,
//   StyleSheet,
//   Text,
//   TextInput,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Svg, { Path } from "react-native-svg";
// import { playHapticClick, playScanStart } from "../services/soundService";

// import { translations } from "../services/translations";
// import { LanguageCode } from "../types";

// const { width } = Dimensions.get("window");
// const TAB_HEIGHT = 80;
// const BRAND_BLUE = "rgb(10, 132, 255)";

// const playHaptic = playHapticClick;

// interface ScaleButtonProps {
//   onPress?: () => void;
//   style?: StyleProp<ViewStyle>;
//   children: React.ReactNode;
//   hitSlop?: number | Insets | null | undefined;
//   activeOpacity?: number;
// }

// const ScaleButton = ({
//   onPress,
//   style,
//   children,
//   hitSlop,
//   activeOpacity,
// }: ScaleButtonProps) => {
//   const scaleValue = useRef(new Animated.Value(1)).current;

//   const onPressIn = () => {
//     Animated.spring(scaleValue, {
//       toValue: 0.9,
//       useNativeDriver: true,
//       speed: 50,
//       bounciness: 10,
//     }).start();
//   };

//   const onPressOut = () => {
//     Animated.spring(scaleValue, {
//       toValue: 1,
//       useNativeDriver: true,
//       speed: 50,
//       bounciness: 10,
//     }).start();
//   };

//   return (
//     <Pressable
//       onPress={onPress}
//       onPressIn={onPressIn}
//       onPressOut={onPressOut}
//       hitSlop={hitSlop}
//       style={{ alignItems: "center", justifyContent: "center" }}
//     >
//       <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
//         {children}
//       </Animated.View>
//     </Pressable>
//   );
// };

// const SafeBlur = ({
//   style,
//   intensity = 20,
// }: {
//   style?: StyleProp<ViewStyle>;
//   intensity?: number;
// }) => {
//   if (Platform.OS === "android") {
//     return (
//       <View style={[style, { backgroundColor: "rgba(20, 20, 25, 0.9)" }]} />
//     );
//   }
//   return <BlurView intensity={intensity} tint="dark" style={style} />;
// };

// interface GlassCardProps {
//   children?: React.ReactNode;
//   style?: StyleProp<ViewStyle>;
//   onPress?: () => void;
// }

// // export const GlassCard = ({ children, style, onPress }: GlassCardProps) => {
// //   const Container = onPress ? TouchableOpacity : View;

// //   return (
// //     <Container
// //       onPress={() => {
// //         if (onPress) {
// //           playHaptic();
// //           onPress();
// //         }
// //       }}
// //       activeOpacity={0.8}
// //       style={[styles.cardContainer, style]}
// //     >
// //       <View style={StyleSheet.absoluteFill}>
// //         <SafeBlur intensity={40} style={StyleSheet.absoluteFill} />
// //       </View>
// //       <View style={styles.cardContent}>{children}</View>
// //     </Container>
// //   );
// // };



// interface PageHeaderProps {
//   title: string;
//   subtitle?: string;
//   rightAction?: React.ReactNode;
// }

// export const PageHeader = ({
//   title,
//   subtitle,
//   rightAction,
// }: PageHeaderProps) => (
//   <View style={styles.headerContainer}>
//     <View>
//       <Text style={styles.headerTitle}>{title}</Text>
//       {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
//     </View>
//     {rightAction && <View>{rightAction}</View>}
//   </View>
// );

// interface NotificationModalProps {
//   message: string;
//   type: "error" | "success" | "info";
//   onClose: () => void;
//   actionLabel?: string;
//   onAction?: () => void;
//   visible: boolean;
// }

// export const NotificationModal = ({
//   message,
//   type,
//   onClose,
//   actionLabel = "Okay",
//   onAction,
//   visible,
// }: NotificationModalProps) => {
//   const config = {
//     error: {
//       icon: "alert-circle",
//       color: "#FF453A",
//       btnBg: "rgba(255, 69, 58, 0.2)",
//     },
//     success: { icon: "checkmark-circle", color: "#30D158", btnBg: "#30D158" },
//     info: { icon: "information-circle", color: "#0A84FF", btnBg: "#0A84FF" },
//   };
//   const current = config[type];

//   return (
//     <Modal visible={visible} transparent animationType="fade">
//       <View style={styles.modalOverlay}>
//         <SafeBlur intensity={20} style={StyleSheet.absoluteFill} />
//         <View style={styles.modalContent}>
//           <View style={styles.modalIconContainer}>
//             <Ionicons
//               name={current.icon as any}
//               size={40}
//               color={current.color}
//             />
//           </View>
//           <Text style={[styles.modalTitle, { color: current.color }]}>
//             {type.charAt(0).toUpperCase() + type.slice(1)}
//           </Text>
//           <Text style={styles.modalMessage}>{message}</Text>

//           <TouchableOpacity
//             style={[styles.modalButton, { backgroundColor: current.btnBg }]}
//             onPress={() => {
//               playHaptic();
//               if (onAction) onAction();
//               onClose();
//             }}
//           >
//             <Text
//               style={[
//                 styles.modalBtnText,
//                 { color: type === "error" ? current.color : "#fff" },
//               ]}
//             >
//               {actionLabel}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// interface GlassButtonProps {
//   onPress: () => void;
//   children: React.ReactNode;
//   variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
//   isLoading?: boolean;
//   disabled?: boolean;
//   style?: StyleProp<ViewStyle>;
//   size?: "sm" | "md";
// }

// export const GlassButton = ({
//   onPress,
//   children,
//   variant = "primary",
//   isLoading,
//   disabled,
//   style,
// }: GlassButtonProps) => {
//   const getStyles = () => {
//     switch (variant) {
//       case "primary":
//         return { bg: "#0A84FF", text: "#fff", border: "transparent" };
//       case "secondary":
//         return {
//           bg: "rgba(255,255,255,0.1)",
//           text: "#fff",
//           border: "rgba(255,255,255,0.2)",
//         };
//       case "danger":
//         return {
//           bg: "rgba(255, 69, 58, 0.1)",
//           text: "#FF453A",
//           border: "rgba(255, 69, 58, 0.2)",
//         };
//       case "success":
//         return {
//           bg: "rgba(48, 209, 88, 0.15)",
//           text: "#30D158",
//           border: "rgba(48, 209, 88, 0.3)",
//         };
//       case "ghost":
//         return {
//           bg: "transparent",
//           text: "rgba(255,255,255,0.7)",
//           border: "transparent",
//         };
//       default:
//         return { bg: "#0A84FF", text: "#fff", border: "transparent" };
//     }
//   };
//   const theme = getStyles();

//   return (
//     <TouchableOpacity
//       style={[
//         styles.button,
//         {
//           backgroundColor: theme.bg,
//           borderColor: theme.border,
//           borderWidth: 1,
//         },
//         disabled && { opacity: 0.5 },
//         style,
//       ]}
//       onPress={() => {
//         playHaptic();
//         onPress();
//       }}
//       disabled={isLoading || disabled}
//     >
//       {isLoading ? (
//         <ActivityIndicator color={theme.text} />
//       ) : (
//         <Text style={[styles.btnText, { color: theme.text }]}>{children}</Text>
//       )}
//     </TouchableOpacity>
//   );
// };

// // input

// interface GlassInputProps {
//   value: string;
//   onChangeText: (text: string) => void;
//   placeholder?: string;
//   secureTextEntry?: boolean;
//   rightElement?: React.ReactNode;
//   iconName?: keyof typeof Ionicons.glyphMap;
//   keyboardType?: "default" | "email-address" | "numeric";
//   autoCapitalize?: "none" | "sentences" | "words" | "characters";
//   style?: StyleProp<ViewStyle>;
//   inputStyle?: StyleProp<TextStyle>;
// }

// export const GlassInput = ({
//   value,
//   onChangeText,
//   placeholder,
//   secureTextEntry,
//   rightElement,
//   iconName,
//   keyboardType,
//   autoCapitalize,
//   style,
//   inputStyle,
// }: GlassInputProps) => (
//   <View style={[styles.inputWrapper, style]}>
//     <View
//       style={[
//         StyleSheet.absoluteFill,
//         { backgroundColor: "rgba(255,255,255,0.05)" },
//       ]}
//     />

//     <View style={styles.inputContent}>
//       {iconName && (
//         <Ionicons
//           name={iconName}
//           size={20}
//           color="rgba(255,255,255,0.4)"
//           style={{ marginLeft: 15 }}
//         />
//       )}
//       <TextInput
//         style={[
//           styles.input,
//           iconName ? { paddingLeft: 10 } : { paddingLeft: 15 },
//           inputStyle,
//         ]}
//         value={value}
//         onChangeText={onChangeText}
//         placeholder={placeholder}
//         placeholderTextColor="rgba(255,255,255,0.4)"
//         secureTextEntry={secureTextEntry}
//         keyboardType={keyboardType}
//         autoCapitalize={autoCapitalize}
//       />
//       {rightElement && <View style={{ paddingRight: 15 }}>{rightElement}</View>}
//     </View>
//   </View>
// );

// interface SegmentedControlProps {
//   options: string[];
//   selected: string;
//   onChange: (val: string) => void;
// }

// export const SegmentedControl = ({
//   options,
//   selected,
//   onChange,
// }: SegmentedControlProps) => (
//   <View style={styles.segmentContainer}>
//     {options.map((opt) => (
//       <TouchableOpacity
//         key={opt}
//         style={[styles.segmentBtn, selected === opt && styles.segmentBtnActive]}
//         onPress={() => {
//           playHaptic();
//           onChange(opt);
//         }}
//       >
//         <Text
//           style={[
//             styles.segmentText,
//             selected === opt && { color: "#fff", fontWeight: "bold" },
//           ]}
//         >
//           {opt}
//         </Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

// export const Badge = ({
//   children,
//   color = "blue",
//   style,
// }: {
//   children: React.ReactNode;
//   color?: "blue" | "green" | "red" | "orange" | "gray";
//   style?: StyleProp<ViewStyle>;
// }) => {
//   const colors = {
//     blue: {
//       bg: "rgba(10,132,255,0.1)",
//       text: "#0A84FF",
//       border: "rgba(10,132,255,0.2)",
//     },
//     green: {
//       bg: "rgba(48,209,88,0.1)",
//       text: "#30D158",
//       border: "rgba(48,209,88,0.2)",
//     },
//     red: {
//       bg: "rgba(255,69,58,0.1)",
//       text: "#FF453A",
//       border: "rgba(255,69,58,0.2)",
//     },
//     orange: {
//       bg: "rgba(255,149,0,0.1)",
//       text: "#FF9500",
//       border: "rgba(255,149,0,0.2)",
//     },
//     gray: {
//       bg: "rgba(255,255,255,0.1)",
//       text: "rgba(255,255,255,0.6)",
//       border: "rgba(255,255,255,0.1)",
//     },
//   };
//   const theme = colors[color];
//   return (
//     <View
//       style={[
//         styles.badge,
//         { backgroundColor: theme.bg, borderColor: theme.border },
//         style,
//       ]}
//     >
//       <Text style={[styles.badgeText, { color: theme.text }]}>{children}</Text>
//     </View>
//   );
// };
// interface BottomTabNavProps {
//   activeTab: string;
//   language?: LanguageCode;
// }

// // export const BottomTabNav = ({
// //   activeTab,
// //   language = "en",
// // }: BottomTabNavProps) => {
// //   const router = useRouter();
// //   const insets = useSafeAreaInsets();
// //   const t = translations[language] || translations["en"];

// //   const mainTabs = [
// //     {
// //       key: "tracker",
// //       icon: "radio-outline",
// //       label: t.tracker_title || "Tracker",
// //       route: "/(tabs)/tracker",
// //     },
// //     {
// //       key: "signals",
// //       icon: "flash-outline",
// //       label: t.signals_title || "Signals",
// //       route: "../(tabs)/signals",
// //     },
// //     {
// //       key: "history",
// //       icon: "time-outline",
// //       label: t.history_title || "History",
// //       route: "/(tabs)/history",
// //     },
// //     {
// //       key: "profile",
// //       icon: "person-outline",
// //       label: t.profile_title || "Profile",
// //       route: "/(tabs)/profile",
// //     },
// //   ];

// //   return (
// //     <View style={[styles.navWrapper, { bottom: 22 + insets.bottom }]}>
// //       <View style={styles.navPill}>
// //         {mainTabs.map((tab) => {
// //           const isActive = activeTab === tab.key;
// //           return (
// //             <ScaleButton
// //               key={tab.key}
// //               onPress={() => {
// //                 playHapticClick();
// //                 router.replace(tab.route as any);
// //               }}
// //               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
// //               style={styles.navItem}
// //             >
// //               <Ionicons
// //                 name={tab.icon as any}
// //                 size={22}
// //                 color={isActive ? "#007AFF" : "rgba(255,255,255,0.4)"}
// //               />
// //               <Text
// //                 style={[
// //                   styles.navLabel,
// //                   { color: isActive ? "#007AFF" : "rgba(255,255,255,0.4)" },
// //                 ]}
// //               >
// //                 {tab.label}
// //               </Text>
// //             </ScaleButton>
// //           );
// //         })}
// //       </View>

// //       {(() => {
// //         const isScannerActive = activeTab === "analyzer";
// //         const activeColor = "rgba(255, 255, 255, 1)";
// //         const inactiveColor = "#007AFF";

// //         return (
// //           <ScaleButton
// //             style={[
// //               styles.scannerBase,
// //               isScannerActive
// //                 ? styles.scannerActiveWrapper
// //                 : styles.scannerGlass,
// //             ]}
// //             onPress={() => {
// //               playScanStart();
// //               router.replace("/(tabs)/analyzer");
// //             }}
// //             activeOpacity={0.7}
// //           >
// //             <View style={isScannerActive ? styles.iconGlow : undefined}>
// //               <CustomScanIcon
// //                 color={isScannerActive ? activeColor : inactiveColor}
// //                 size={28}
// //               />
// //             </View>
// //           </ScaleButton>
// //         );
// //       })()}
// //     </View>
// //   );
// // };

// export const BottomTabNav = ({
//   activeTab,
//   language = "en",
// }: BottomTabNavProps) => {
//   const router = useRouter();
//   const insets = useSafeAreaInsets();
//   const t = translations[language] || translations["en"];

//   const mainTabs = [
//     {
//       key: "tracker",
//       icon: "radio-outline",
//       label: t.tracker_title || "Tracker",
//       route: "/(tabs)/tracker", // Absolute path
//     },
//     {
//       key: "signals",
//       icon: "flash-outline",
//       label: t.signals_title || "Signals",
//       route: "/(tabs)/signals", // Fixed from ../
//     },
//     {
//       key: "history",
//       icon: "time-outline",
//       label: t.history_title || "History",
//       route: "/(tabs)/history", // Absolute path
//     },
//     {
//       key: "profile",
//       icon: "person-outline",
//       label: t.profile_title || "Profile",
//       route: "/(tabs)/profile", // Absolute path
//     },
//   ];

//   return (
//     <View style={[styles.navWrapper, { bottom: 22 + insets.bottom }]}>
//       <View style={styles.navPill}>
//         {mainTabs.map((tab) => {
//           const isActive = activeTab === tab.key;
//           return (
//             <ScaleButton
//               key={tab.key}
//               onPress={() => {
//                 playHapticClick();
//                 // Use push or navigate for smoother tab transitions
//                 router.push(tab.route as any);
//               }}
//               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//               style={styles.navItem}
//             >
//               <Ionicons
//                 name={tab.icon as any}
//                 size={22}
//                 color={isActive ? "#007AFF" : "rgba(255,255,255,0.4)"}
//               />
//               <Text
//                 style={[
//                   styles.navLabel,
//                   { color: isActive ? "#007AFF" : "rgba(255,255,255,0.4)" },
//                 ]}
//               >
//                 {tab.label}
//               </Text>
//             </ScaleButton>
//           );
//         })}
//       </View>

//       {(() => {
//         const isScannerActive = activeTab === "analyzer";
//         return (
//           <ScaleButton
//             style={[
//               styles.scannerBase,
//               isScannerActive
//                 ? styles.scannerActiveWrapper
//                 : styles.scannerGlass,
//             ]}
//             onPress={() => {
//               playScanStart();
//               router.push("/(tabs)/analyzer"); // Consistent routing
//             }}
//             activeOpacity={0.7}
//           >
//             <View style={isScannerActive ? styles.iconGlow : undefined}>
//               <CustomScanIcon
//                 color={isScannerActive ? "#FFFFFF" : "#007AFF"}
//                 size={28}
//               />
//             </View>
//           </ScaleButton>
//         );
//       })()}
//     </View>
//   );
// };

// interface IconProps {
//   color: string;
//   size?: number;
// }

// const CustomScanIcon = ({ color, size = 30 }: IconProps) => {
//   return (
//     <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
//       <Path
//         d="M3 7V5a2 2 0 0 1 2-2h2"
//         stroke={color}
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <Path
//         d="M17 3h2a2 2 0 0 1 2 2v2"
//         stroke={color}
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <Path
//         d="M21 17v2a2 2 0 0 1-2 2h-2"
//         stroke={color}
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <Path
//         d="M7 21H5a2 2 0 0 1-2-2v-2"
//         stroke={color}
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />

//       <Path
//         d="M12 8v8"
//         stroke={color}
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//       <Path
//         d="M8 12h8"
//         stroke={color}
//         strokeWidth="2.5"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       />
//     </Svg>
//   );
// };

// export const GlassBox = ({ children, style, padding, width, height }: any) => {
//   return (
//     <View
//       style={[
//         {
//           backgroundColor: "rgba(20, 20, 25, 0.8)",
//           borderRadius: 20,
//           borderWidth: 1,
//           borderColor: "rgba(255,255,255,0.1)",
//           overflow: "hidden",
//           padding: padding !== undefined ? padding : 16,
//         },
//         width && { width },
//         height && { height },
//         style,
//       ]}
//     >
//       {children}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   cardContainer: {
//     borderRadius: 24,
//     overflow: "hidden",
//     backgroundColor: "rgba(255,255,255,0.05)",
//     borderColor: "rgba(255,255,255,0.1)",
//     borderWidth: 1,
//   },
//   cardContent: { padding: 24 },

//   headerContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 60,
//     paddingBottom: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-end",
//   },
//   headerTitle: { fontSize: 34, fontWeight: "bold", color: "#fff" },
//   headerSubtitle: {
//     fontSize: 16,
//     color: "rgba(255,255,255,0.6)",
//     marginTop: 4,
//   },

//   inputWrapper: {
//     borderRadius: 16,
//     overflow: "hidden",
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   inputContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     height: 56,
//     backgroundColor: "rgba(255,255,255,0.05)",
//   },
//   input: { flex: 1, color: "#fff", fontSize: 16, height: "100%" },

//   button: {
//     height: 56,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//   },
//   btnText: { fontSize: 16, fontWeight: "600" },

//   segmentContainer: {
//     flexDirection: "row",
//     backgroundColor: "rgba(255,255,255,0.1)",
//     padding: 4,
//     borderRadius: 12,
//     marginBottom: 20,
//   },
//   segmentBtn: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: "center",
//     borderRadius: 10,
//   },
//   segmentBtnActive: {
//     backgroundColor: "rgba(255,255,255,0.2)",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   segmentText: {
//     color: "rgba(255,255,255,0.5)",
//     fontSize: 13,
//     fontWeight: "600",
//   },

//   badge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 6,
//     borderWidth: 1,
//     alignSelf: "flex-start",
//   },
//   badgeText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },

//   modalOverlay: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0,0,0,0.8)",
//   },
//   modalContent: {
//     width: "80%",
//     backgroundColor: "#1C1C1E",
//     borderRadius: 30,
//     padding: 24,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },
//   modalIconContainer: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "rgba(255,255,255,0.05)",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
//   modalMessage: {
//     fontSize: 16,
//     color: "rgba(255,255,255,0.7)",
//     textAlign: "center",
//     marginBottom: 24,
//     lineHeight: 22,
//   },
//   modalButton: {
//     width: "100%",
//     height: 50,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalBtnText: { fontSize: 16, fontWeight: "bold" },

//   navWrapper: {
//     position: "absolute",
//     bottom: 22,
//     left: 20,
//     right: 20,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 12,
//     zIndex: 100,
//   },

//   navPill: {
//     flex: 1,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "rgba(25, 25, 30, 0.95)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",

//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-evenly",
//     paddingHorizontal: 6,

//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },

//   navItem: {
//     alignItems: "center",
//     justifyContent: "center",
//     height: "100%",
//     paddingHorizontal: 10,
//     gap: 3,
//   },

//   navLabel: {
//     fontSize: 10,
//     fontWeight: "600",
//     letterSpacing: 0.3,
//   },

//   scannerButton: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     backgroundColor: "#007AFF",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",

//     shadowColor: "#007AFF",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 10,
//     elevation: 8,
//   },

//   scannerBase: {
//     width: 64,
//     height: 64,
//     borderRadius: 32,
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   scannerGlass: {
//     backgroundColor: "rgba(25, 25, 30, 0.95)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.1)",
//   },

//   scannerActiveWrapper: {
//     backgroundColor: "#007AFF",
//     borderWidth: 1,
//     borderColor: "rgba(80, 164, 254, 0.5)",
//     shadowColor: "#007AFF",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.5,
//     shadowRadius: 10,
//     elevation: 5,
//   },

//   iconGlow: {
//     shadowColor: "#007AFF",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 1,
//     shadowRadius: 8,
//     elevation: 10,
//   },
// });


import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Insets,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { playHapticClick, playScanStart } from "../services/soundService";

import { translations } from "../services/translations";
import { LanguageCode } from "../types";

const { width } = Dimensions.get("window");
const TAB_HEIGHT = 80;
const BRAND_BLUE = "rgb(10, 132, 255)";

const playHaptic = playHapticClick;

interface ScaleButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  hitSlop?: number | Insets | null | undefined;
  activeOpacity?: number;
}

const ScaleButton = ({
  onPress,
  style,
  children,
  hitSlop,
  activeOpacity,
}: ScaleButtonProps) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      hitSlop={hitSlop}
      style={{ alignItems: "center", justifyContent: "center" }}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

const SafeBlur = ({
  style,
  intensity = 20,
}: {
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}) => {
  if (Platform.OS === "android") {
    return (
      <View style={[style, { backgroundColor: "rgba(20, 20, 25, 0.9)" }]} />
    );
  }
  return <BlurView intensity={intensity} tint="dark" style={style} />;
};

interface GlassCardProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const GlassCard = ({ children, style, onPress }: GlassCardProps) => {
  // 🛠️ FIX: Cast to React.ElementType to resolve the call signature error
  const Container = (onPress ? TouchableOpacity : View) as React.ElementType;

  return (
    <Container
      // We only pass these props if we know Container is a TouchableOpacity
      onPress={onPress ? () => {
        playHaptic();
        onPress();
      } : undefined}
      activeOpacity={onPress ? 0.8 : undefined}
      style={[styles.cardContainer, style]}
    >
      <View style={StyleSheet.absoluteFill}>
        <SafeBlur intensity={40} style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.cardContent}>{children}</View>
    </Container>
  );
};

// export const GlassCard = ({ children, style, onPress }: GlassCardProps) => {
//   const Container = onPress ? TouchableOpacity : View;

//   return (
//     <Container
//       onPress={() => {
//         if (onPress) {
//           playHaptic();
//           onPress();
//         }
//       }}
//       activeOpacity={0.8}
//       style={[styles.cardContainer, style]}
//     >
//       <View style={StyleSheet.absoluteFill}>
//         <SafeBlur intensity={40} style={StyleSheet.absoluteFill} />
//       </View>
//       <View style={styles.cardContent}>{children}</View>
//     </Container>
//   );
// };

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
}

export const PageHeader = ({
  title,
  subtitle,
  rightAction,
}: PageHeaderProps) => (
  <View style={styles.headerContainer}>
    <View>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
    </View>
    {rightAction && <View>{rightAction}</View>}
  </View>
);

interface NotificationModalProps {
  message: string;
  type: "error" | "success" | "info";
  onClose: () => void;
  actionLabel?: string;
  onAction?: () => void;
  visible: boolean;
}

export const NotificationModal = ({
  message,
  type,
  onClose,
  actionLabel = "Okay",
  onAction,
  visible,
}: NotificationModalProps) => {
  const config = {
    error: {
      icon: "alert-circle",
      color: "#FF453A",
      btnBg: "rgba(255, 69, 58, 0.2)",
    },
    success: { icon: "checkmark-circle", color: "#30D158", btnBg: "#30D158" },
    info: { icon: "information-circle", color: "#0A84FF", btnBg: "#0A84FF" },
  };
  const current = config[type];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <SafeBlur intensity={20} style={StyleSheet.absoluteFill} />
        <View style={styles.modalContent}>
          <View style={styles.modalIconContainer}>
            <Ionicons
              name={current.icon as any}
              size={40}
              color={current.color}
            />
          </View>
          <Text style={[styles.modalTitle, { color: current.color }]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: current.btnBg }]}
            onPress={() => {
              playHaptic();
              if (onAction) onAction();
              onClose();
            }}
          >
            <Text
              style={[
                styles.modalBtnText,
                { color: type === "error" ? current.color : "#fff" },
              ]}
            >
              {actionLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

interface GlassButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: "sm" | "md";
}

export const GlassButton = ({
  onPress,
  children,
  variant = "primary",
  isLoading,
  disabled,
  style,
}: GlassButtonProps) => {
  const getStyles = () => {
    switch (variant) {
      case "primary":
        return { bg: "#0A84FF", text: "#fff", border: "transparent" };
      case "secondary":
        return {
          bg: "rgba(255,255,255,0.1)",
          text: "#fff",
          border: "rgba(255,255,255,0.2)",
        };
      case "danger":
        return {
          bg: "rgba(255, 69, 58, 0.1)",
          text: "#FF453A",
          border: "rgba(255, 69, 58, 0.2)",
        };
      case "success":
        return {
          bg: "rgba(48, 209, 88, 0.15)",
          text: "#30D158",
          border: "rgba(48, 209, 88, 0.3)",
        };
      case "ghost":
        return {
          bg: "transparent",
          text: "rgba(255,255,255,0.7)",
          border: "transparent",
        };
      default:
        return { bg: "#0A84FF", text: "#fff", border: "transparent" };
    }
  };
  const theme = getStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          borderWidth: 1,
        },
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={() => {
        playHaptic();
        onPress();
      }}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <Text style={[styles.btnText, { color: theme.text }]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

// input

interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightElement?: React.ReactNode;
  iconName?: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const GlassInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  rightElement,
  iconName,
  keyboardType,
  autoCapitalize,
  style,
  inputStyle,
}: GlassInputProps) => (
  <View style={[styles.inputWrapper, style]}>
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(255,255,255,0.05)" },
      ]}
    />

    <View style={styles.inputContent}>
      {iconName && (
        <Ionicons
          name={iconName}
          size={20}
          color="rgba(255,255,255,0.4)"
          style={{ marginLeft: 15 }}
        />
      )}
      <TextInput
        style={[
          styles.input,
          iconName ? { paddingLeft: 10 } : { paddingLeft: 15 },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {rightElement && <View style={{ paddingRight: 15 }}>{rightElement}</View>}
    </View>
  </View>
);

interface SegmentedControlProps {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
}

export const SegmentedControl = ({
  options,
  selected,
  onChange,
}: SegmentedControlProps) => (
  <View style={styles.segmentContainer}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[styles.segmentBtn, selected === opt && styles.segmentBtnActive]}
        onPress={() => {
          playHaptic();
          onChange(opt);
        }}
      >
        <Text
          style={[
            styles.segmentText,
            selected === opt && { color: "#fff", fontWeight: "bold" },
          ]}
        >
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export const Badge = ({
  children,
  color = "blue",
  style,
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "red" | "orange" | "gray";
  style?: StyleProp<ViewStyle>;
}) => {
  const colors = {
    blue: {
      bg: "rgba(10,132,255,0.1)",
      text: "#0A84FF",
      border: "rgba(10,132,255,0.2)",
    },
    green: {
      bg: "rgba(48,209,88,0.1)",
      text: "#30D158",
      border: "rgba(48,209,88,0.2)",
    },
    red: {
      bg: "rgba(255,69,58,0.1)",
      text: "#FF453A",
      border: "rgba(255,69,58,0.2)",
    },
    orange: {
      bg: "rgba(255,149,0,0.1)",
      text: "#FF9500",
      border: "rgba(255,149,0,0.2)",
    },
    gray: {
      bg: "rgba(255,255,255,0.1)",
      text: "rgba(255,255,255,0.6)",
      border: "rgba(255,255,255,0.1)",
    },
  };
  const theme = colors[color];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.bg, borderColor: theme.border },
        style,
      ]}
    >
      <Text style={[styles.badgeText, { color: theme.text }]}>{children}</Text>
    </View>
  );
};
interface BottomTabNavProps {
  activeTab: string;
  language?: LanguageCode;
}

export const BottomTabNav = ({
  activeTab,
  language = "en",
}: BottomTabNavProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t = translations[language] || translations["en"];

  const mainTabs = [
    {
      key: "tracker",
      icon: "radio-outline",
      label: t.tracker_title || "Tracker",
      route: "/(tabs)/tracker",
    },
    {
      key: "signals",
      icon: "flash-outline",
      label: t.signals_title || "Signals",
      route: "../(tabs)/signals",
    },
    {
      key: "history",
      icon: "time-outline",
      label: t.history_title || "History",
      route: "/(tabs)/history",
    },
    {
      key: "profile",
      icon: "person-outline",
      label: t.profile_title || "Profile",
      route: "/(tabs)/profile",
    },
  ];

  return (
    <View style={[styles.navWrapper, { bottom: 22 + insets.bottom }]}>
      <View style={styles.navPill}>
        {mainTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <ScaleButton
              key={tab.key}
              onPress={() => {
                playHapticClick();
                router.replace(tab.route as any);
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.navItem}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={isActive ? "#007AFF" : "rgba(255,255,255,0.4)"}
              />
              <Text
                style={[
                  styles.navLabel,
                  { color: isActive ? "#007AFF" : "rgba(255,255,255,0.4)" },
                ]}
              >
                {tab.label}
              </Text>
            </ScaleButton>
          );
        })}
      </View>

      {(() => {
        const isScannerActive = activeTab === "analyzer";
        const activeColor = "rgba(255, 255, 255, 1)";
        const inactiveColor = "#007AFF";

        return (
          <ScaleButton
            style={[
              styles.scannerBase,
              isScannerActive
                ? styles.scannerActiveWrapper
                : styles.scannerGlass,
            ]}
            onPress={() => {
              playScanStart();
              router.replace("/(tabs)/analyzer");
            }}
            activeOpacity={0.7}
          >
            <View style={isScannerActive ? styles.iconGlow : undefined}>
              <CustomScanIcon
                color={isScannerActive ? activeColor : inactiveColor}
                size={28}
              />
            </View>
          </ScaleButton>
        );
      })()}
    </View>
  );
};

interface IconProps {
  color: string;
  size?: number;
}

const CustomScanIcon = ({ color, size = 30 }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 7V5a2 2 0 0 1 2-2h2"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17 3h2a2 2 0 0 1 2 2v2"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 17v2a2 2 0 0 1-2 2h-2"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M7 21H5a2 2 0 0 1-2-2v-2"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <Path
        d="M12 8v8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 12h8"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export const GlassBox = ({ children, style, padding, width, height }: any) => {
  return (
    <View
      style={[
        {
          backgroundColor: "rgba(20, 20, 25, 0.8)",
          borderRadius: 20,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.1)",
          overflow: "hidden",
          padding: padding !== undefined ? padding : 16,
        },
        width && { width },
        height && { height },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
  },
  cardContent: { padding: 24 },

  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  headerTitle: { fontSize: 34, fontWeight: "bold", color: "#fff" },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },

  inputWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputContent: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  input: { flex: 1, color: "#fff", fontSize: 16, height: "100%" },

  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  btnText: { fontSize: 16, fontWeight: "600" },

  segmentContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  segmentText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "600",
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1C1C1E",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalMessage: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    width: "100%",
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: { fontSize: 16, fontWeight: "bold" },

  navWrapper: {
    position: "absolute",
    bottom: 22,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 100,
  },

  navPill: {
    flex: 1,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(25, 25, 30, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingHorizontal: 6,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: 10,
    gap: 3,
  },

  navLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  scannerButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",

    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  scannerBase: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  scannerGlass: {
    backgroundColor: "rgba(25, 25, 30, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  scannerActiveWrapper: {
    backgroundColor: "#007AFF",
    borderWidth: 1,
    borderColor: "rgba(80, 164, 254, 0.5)",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },

  iconGlow: {
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
  },
});