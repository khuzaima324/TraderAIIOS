// // import { Linking, Platform } from "react-native";
// // import Purchases, {
// //   CustomerInfo,
// //   LOG_LEVEL,
// //   PURCHASES_ERROR_CODE,
// //   PurchasesPackage,
// // } from "react-native-purchases";
// // import { SubscriptionTier } from "../types";

// // const API_KEYS = {
// //   ios: "appl_VaWLLyYXCEMahgcYiyancmvRFfe",
// //   android: "goog_qVyMZdgdTHmyHYlrpbVNoQHaFPL",
// // };

// // export const FALLBACK_PRICES = {
// //   PLUS: {
// //     MONTHLY: "$29.99 / month",
// //     YEARLY: "$299.99 / year",
// //   },
// //   PRO: {
// //     MONTHLY: "$49.99 / month",
// //     YEARLY: "$499.99 / year",
// //   },
// // };

// // const ENTITLEMENTS = {
// //   PLUS: "plus_access",
// //   PRO: "pro_access",
// // };

// // const TIER_WEIGHTS = {
// //   [SubscriptionTier.FREE]: 0,
// //   [SubscriptionTier.PLUS]: 1,
// //   [SubscriptionTier.PRO]: 2,
// // };

// // export interface IAPPackages {
// //   plusMonthly: PurchasesPackage | null;
// //   plusYearly: PurchasesPackage | null;
// //   proMonthly: PurchasesPackage | null;
// //   proYearly: PurchasesPackage | null;
// // }

// // export const debugEntitlements = async () => {
// //   try {
// //     const info = await Purchases.getCustomerInfo();
// //   } catch (e) {}
// // };

// // export const initializeIAP = async (userId: string) => {
// //   if (Platform.OS === "web") return;

// //   try {
// //     await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

// //     let isConfigured = false;
// //     try {
// //       isConfigured = await Purchases.isConfigured();
// //     } catch (e) {}

// //     if (isConfigured) {
// //       const info = await Purchases.getCustomerInfo();

// //       if (info.originalAppUserId === userId) {
// //         return;
// //       }

// //       await Purchases.logIn(userId);
// //       return;
// //     }

// //     if (Platform.OS === "ios") {
// //       await Purchases.configure({ apiKey: API_KEYS.ios, appUserID: userId });
// //     } else if (Platform.OS === "android") {
// //       await Purchases.configure({
// //         apiKey: API_KEYS.android,
// //         appUserID: userId,
// //       });
// //     }
// //   } catch (error: any) {
// //     if (
// //       error.code ===
// //       Purchases.PURCHASES_ERROR_CODE.OPERATION_ALREADY_IN_PROGRESS_ERROR
// //     ) {
// //       return;
// //     }
// //     console.error("IAP Init Error:", error);
// //   }
// // };

// // export const determineTierFromInfo = (info: CustomerInfo): SubscriptionTier => {
// //   if (info.entitlements.active[ENTITLEMENTS.PRO]) {
// //     return SubscriptionTier.PRO;
// //   } else if (info.entitlements.active[ENTITLEMENTS.PLUS]) {
// //     return SubscriptionTier.PLUS;
// //   }
// //   return SubscriptionTier.FREE;
// // };

// // export const determineActiveProductId = (info: CustomerInfo): string | null => {
// //   if (info.entitlements.active[ENTITLEMENTS.PRO]) {
// //     return info.entitlements.active[ENTITLEMENTS.PRO].productIdentifier;
// //   } else if (info.entitlements.active[ENTITLEMENTS.PLUS]) {
// //     return info.entitlements.active[ENTITLEMENTS.PLUS].productIdentifier;
// //   }
// //   return null;
// // };

// // export const getCurrentActiveProductId = async (): Promise<string | null> => {
// //   if (Platform.OS === "web") return null;
// //   try {
// //     const info = await Purchases.getCustomerInfo();
// //     return determineActiveProductId(info);
// //   } catch (error) {
// //     return null;
// //   }
// // };

// // export const getSubscriptionStatus = async (): Promise<SubscriptionTier> => {
// //   if (Platform.OS === "web") return SubscriptionTier.FREE;
// //   try {
// //     const customerInfo = await Purchases.getCustomerInfo();
// //     return determineTierFromInfo(customerInfo);
// //   } catch (error) {
// //     console.error("Error checking subscription:", error);
// //     return SubscriptionTier.FREE;
// //   }
// // };

// // export const listenToCustomerInfoChanges = (
// //   onInfoUpdate: (tier: SubscriptionTier) => void,
// // ) => {
// //   if (Platform.OS === "web") return () => {};

// //   const listener = (info: CustomerInfo) => {
// //     const newTier = determineTierFromInfo(info);
// //     onInfoUpdate(newTier);
// //   };

// //   Purchases.addCustomerInfoUpdateListener(listener);

// //   return () => {
// //     try {
// //       Purchases.removeCustomerInfoUpdateListener(listener);
// //     } catch (e) {}
// //   };
// // };

// // export const getAppOfferings = async (): Promise<IAPPackages> => {
// //   const empty: IAPPackages = {
// //     plusMonthly: null,
// //     plusYearly: null,
// //     proMonthly: null,
// //     proYearly: null,
// //   };
// //   if (Platform.OS === "web") return empty;

// //   try {
// //     const offerings = await Purchases.getOfferings();

// //     if (offerings.current && offerings.current.availablePackages.length > 0) {
// //       const avail = offerings.current.availablePackages;

// //       return {
// //         plusMonthly:
// //           avail.find((p) => p.identifier === "pkg_traders_ai_plus_monthly") ||
// //           null,
// //         plusYearly:
// //           avail.find((p) => p.identifier === "pkg_traders_ai_plus_yearly") ||
// //           null,
// //         proMonthly:
// //           avail.find((p) => p.identifier === "pkg_traders_ai_pro_monthly") ||
// //           null,
// //         proYearly:
// //           avail.find((p) => p.identifier === "pkg_traders_ai_pro_yearly") ||
// //           null,
// //       };
// //     }
// //   } catch (e) {}
// //   return empty;
// // };

// // export const restorePurchases = async (): Promise<{
// //   tier: SubscriptionTier;
// //   activeProductId: string | null;
// // }> => {
// //   if (Platform.OS === "web")
// //     return { tier: SubscriptionTier.FREE, activeProductId: null };

// //   try {
// //     const customerInfo = await Purchases.restorePurchases();
// //     return {
// //       tier: determineTierFromInfo(customerInfo),
// //       activeProductId: determineActiveProductId(customerInfo),
// //     };
// //   } catch (error) {
// //     console.error("Restore Error:", error);
// //     return { tier: SubscriptionTier.FREE, activeProductId: null };
// //   }
// // };

// // const openSubscriptionSettings = () => {
// //   if (Platform.OS === "ios") {
// //     Linking.openURL("https://apps.apple.com/account/subscriptions");
// //   } else {
// //     Linking.openURL("https://play.google.com/store/account/subscriptions");
// //   }
// // };

// // export const purchaseSubscription = async (
// //   tier: SubscriptionTier,
// //   cycle: "MONTHLY" | "YEARLY",
// // ): Promise<{
// //   success: boolean;
// //   newTier?: SubscriptionTier;
// //   activeProductId?: string | null;
// //   error?: string;
// //   actionTaken?: "PURCHASE" | "REDIRECT";
// // }> => {
// //   if (Platform.OS === "web") {
// //     alert("Purchases are not supported on web.");
// //     return { success: false };
// //   }

// //   try {
// //     const currentInfo = await Purchases.getCustomerInfo();
// //     const currentTier = determineTierFromInfo(currentInfo);

// //     if (TIER_WEIGHTS[currentTier] > TIER_WEIGHTS[tier]) {
// //       openSubscriptionSettings();
// //       return {
// //         success: false,
// //         error: "Redirecting to system settings for downgrade.",
// //         actionTaken: "REDIRECT",
// //       };
// //     }

// //     const offerings = await Purchases.getOfferings();
// //     let identifier = "";

// //     if (tier === SubscriptionTier.PLUS) {
// //       identifier =
// //         cycle === "MONTHLY"
// //           ? "pkg_traders_ai_plus_monthly"
// //           : "pkg_traders_ai_plus_yearly";
// //     } else if (tier === SubscriptionTier.PRO) {
// //       identifier =
// //         cycle === "MONTHLY"
// //           ? "pkg_traders_ai_pro_monthly"
// //           : "pkg_traders_ai_pro_yearly";
// //     }

// //     const packageToBuy = offerings.current?.availablePackages.find(
// //       (pkg) => pkg.identifier === identifier,
// //     );

// //     if (!packageToBuy) {
// //       throw new Error(`Product ${identifier} not found in offerings`);
// //     }

// //     const { customerInfo, productIdentifier } =
// //       await Purchases.purchasePackage(packageToBuy);

// //     const newTier = determineTierFromInfo(customerInfo);
// //     let activeId = determineActiveProductId(customerInfo);

// //     if (!activeId || (newTier === tier && activeId !== productIdentifier)) {
// //       activeId = productIdentifier;
// //     }

// //     const isSuccess =
// //       newTier === tier ||
// //       (tier === SubscriptionTier.PLUS && newTier === SubscriptionTier.PRO);

// //     return {
// //       success: isSuccess,
// //       newTier,
// //       activeProductId: activeId, // Now correctly populated
// //       actionTaken: "PURCHASE",
// //     };
// //   } catch (error: any) {
// //     if (error.userCancelled) {
// //       return { success: false };
// //     }

// //     if (error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
// //       const restoreResult = await restorePurchases();
// //       return {
// //         success: true,
// //         newTier: restoreResult.tier,
// //         activeProductId: restoreResult.activeProductId,
// //         actionTaken: "PURCHASE",
// //       };
// //     }

// //     console.error("Purchase Error:", error);
// //     return { success: false, error: error.message };
// //   }
// // };

// // export const purchaseCredits = async (packId: string): Promise<boolean> => {
// //   if (Platform.OS === "web") return false;

// //   try {
// //     const offerings = await Purchases.getOfferings();
// //     const packageToBuy = offerings.current?.availablePackages.find(
// //       (p) => p.identifier === packId,
// //     );

// //     if (!packageToBuy) throw new Error("Credit pack not found");

// //     await Purchases.purchasePackage(packageToBuy);
// //     return true;
// //   } catch (error: any) {
// //     if (!error.userCancelled) {
// //       console.error("Credit Purchase Error:", error);
// //     }
// //   }
// //   return false;
// // };

// // export const getActivePlanExpiration = async (): Promise<string | null> => {
// //   if (Platform.OS === "web") return null;
// //   try {
// //     const customerInfo = await Purchases.getCustomerInfo();
// //     const activeEntitlement =
// //       customerInfo.entitlements.active["pro_access"] ||
// //       customerInfo.entitlements.active["plus_access"];

// //     if (activeEntitlement && activeEntitlement.expirationDate) {
// //       return activeEntitlement.expirationDate; // Returns ISO (2024-12-31T00:00:00Z)
// //     }
// //   } catch (e) {
// //     console.error("Error fetching expiration:", e);
// //   }
// //   return null;
// // };


// import { Linking, Platform } from "react-native";
// import Purchases, {
//   CustomerInfo,
//   LOG_LEVEL,
//   PURCHASES_ERROR_CODE,
//   PurchasesPackage,
//   PurchasesStoreProduct,
// } from "react-native-purchases";
// import { SubscriptionTier } from "../types";

// const API_KEYS = {
//   ios: "appl_VaWLLyYXCEMahgcYiyancmvRFfe",
//   android: "goog_qVyMZdgdTHmyHYlrpbVNoQHaFPL",
// };

// export const FALLBACK_PRICES = {
//   PLUS: {
//     MONTHLY: "$29.99 / month",
//     YEARLY: "$299.99 / year",
//   },
//   PRO: {
//     MONTHLY: "$49.99 / month",
//     YEARLY: "$499.99 / year",
//   },
// };

// const ENTITLEMENTS = {
//   PLUS: "plus_access",
//   PRO: "pro_access",
// };

// const TIER_WEIGHTS = {
//   [SubscriptionTier.FREE]: 0,
//   [SubscriptionTier.PLUS]: 1,
//   [SubscriptionTier.PRO]: 2,
// };

// export interface IAPPackages {
//   plusMonthly: PurchasesPackage | null;
//   plusYearly: PurchasesPackage | null;
//   proMonthly: PurchasesPackage | null;
//   proYearly: PurchasesPackage | null;
// }

// export const debugEntitlements = async () => {
//   try {
//     const info = await Purchases.getCustomerInfo();
//   } catch (e) {}
// };

// export const initializeIAP = async (userId: string) => {
//   if (Platform.OS === "web") return;

//   try {
//     await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

//     let isConfigured = false;
//     try {
//       isConfigured = await Purchases.isConfigured();
//     } catch (e) {}

//     if (isConfigured) {
//       const info = await Purchases.getCustomerInfo();

//       if (info.originalAppUserId === userId) {
//         return;
//       }

//       await Purchases.logIn(userId);
//       return;
//     }

//     if (Platform.OS === "ios") {
//       await Purchases.configure({ apiKey: API_KEYS.ios, appUserID: userId });
//     } else if (Platform.OS === "android") {
//       await Purchases.configure({
//         apiKey: API_KEYS.android,
//         appUserID: userId,
//       });
//     }
//   } catch (error: any) {
//     if (
//       error.code ===
//       Purchases.PURCHASES_ERROR_CODE.OPERATION_ALREADY_IN_PROGRESS_ERROR
//     ) {
//       return;
//     }
//     console.error("IAP Init Error:", error);
//   }
// };

// export const determineTierFromInfo = (info: CustomerInfo): SubscriptionTier => {
//   if (info.entitlements.active[ENTITLEMENTS.PRO]) {
//     return SubscriptionTier.PRO;
//   } else if (info.entitlements.active[ENTITLEMENTS.PLUS]) {
//     return SubscriptionTier.PLUS;
//   }
//   return SubscriptionTier.FREE;
// };

// export const determineActiveProductId = (info: CustomerInfo): string | null => {
//   if (info.entitlements.active[ENTITLEMENTS.PRO]) {
//     return info.entitlements.active[ENTITLEMENTS.PRO].productIdentifier;
//   } else if (info.entitlements.active[ENTITLEMENTS.PLUS]) {
//     return info.entitlements.active[ENTITLEMENTS.PLUS].productIdentifier;
//   }
//   return null;
// };

// export const getCurrentActiveProductId = async (): Promise<string | null> => {
//   if (Platform.OS === "web") return null;
//   try {
//     const info = await Purchases.getCustomerInfo();
//     return determineActiveProductId(info);
//   } catch (error) {
//     return null;
//   }
// };

// export const getSubscriptionStatus = async (): Promise<SubscriptionTier> => {
//   if (Platform.OS === "web") return SubscriptionTier.FREE;
//   try {
//     const customerInfo = await Purchases.getCustomerInfo();
//     return determineTierFromInfo(customerInfo);
//   } catch (error) {
//     console.error("Error checking subscription:", error);
//     return SubscriptionTier.FREE;
//   }
// };

// export const listenToCustomerInfoChanges = (
//   onInfoUpdate: (tier: SubscriptionTier) => void,
// ) => {
//   if (Platform.OS === "web") return () => {};

//   const listener = (info: CustomerInfo) => {
//     const newTier = determineTierFromInfo(info);
//     onInfoUpdate(newTier);
//   };

//   Purchases.addCustomerInfoUpdateListener(listener);

//   return () => {
//     try {
//       Purchases.removeCustomerInfoUpdateListener(listener);
//     } catch (e) {}
//   };
// };

// // --- HELPER: Create Package from Hardcoded Price ---
// const createFallbackPackage = (
//   id: string, 
//   appleProductId: string, 
//   priceWithText: string, 
//   title: string
// ): PurchasesPackage => {
//   // Extract clean price string (remove " / month")
//   const priceString = priceWithText.split(" /")[0]; 

//   return {
//     identifier: id,
//     packageType: "CUSTOM",
//     product: {
//       identifier: appleProductId,
//       title: title,
//       description: "Unlock access", // Minimal description to satisfy type
//       price: 0, // Placeholder number
//       priceString: priceString, // THE IMPORTANT PART: "$49.99"
//       currencyCode: "USD",
//       introPrice: null,
//       discounts: [],
//       subscriptionPeriod: "P1M",
//     } as unknown as PurchasesStoreProduct,
//     offeringIdentifier: "fallback",
//   };
// };

// export const getAppOfferings = async (): Promise<IAPPackages> => {
//   // Initialize with FALLBACK values immediately
//   // This ensures the prices ALWAYS exist, even if network fails
//   let result: IAPPackages = {
//     plusMonthly: createFallbackPackage(
//       "pkg_traders_ai_plus_monthly", 
//       "traders_ai_plus_monthly", 
//       FALLBACK_PRICES.PLUS.MONTHLY, 
//       "Plus Monthly"
//     ),
//     plusYearly: createFallbackPackage(
//       "pkg_traders_ai_plus_yearly", 
//       "traders_ai_plus_yearly", 
//       FALLBACK_PRICES.PLUS.YEARLY, 
//       "Plus Yearly"
//     ),
//     proMonthly: createFallbackPackage(
//       "pkg_traders_ai_pro_monthly", 
//       "traders_ai_pro_monthly", 
//       FALLBACK_PRICES.PRO.MONTHLY, 
//       "Pro Monthly"
//     ),
//     proYearly: createFallbackPackage(
//       "pkg_traders_ai_pro_yearly", 
//       "traders_ai_pro_yearly", 
//       FALLBACK_PRICES.PRO.YEARLY, 
//       "Pro Yearly"
//     ),
//   };

//   if (Platform.OS === "web") return result;

//   try {
//     const offerings = await Purchases.getOfferings();

//     if (offerings.current && offerings.current.availablePackages.length > 0) {
//       const avail = offerings.current.availablePackages;

//       // Overwrite fallback with REAL data if available
//       const realPlusMonthly = avail.find((p) => p.identifier === "pkg_traders_ai_plus_monthly");
//       const realPlusYearly = avail.find((p) => p.identifier === "pkg_traders_ai_plus_yearly");
//       const realProMonthly = avail.find((p) => p.identifier === "pkg_traders_ai_pro_monthly");
//       const realProYearly = avail.find((p) => p.identifier === "pkg_traders_ai_pro_yearly");

//       if (realPlusMonthly) result.plusMonthly = realPlusMonthly;
//       if (realPlusYearly) result.plusYearly = realPlusYearly;
//       if (realProMonthly) result.proMonthly = realProMonthly;
//       if (realProYearly) result.proYearly = realProYearly;
//     }
//   } catch (e) {
//     // If error, we just keep the result object we created at the top (Fallbacks)
//     console.log("Using fallback prices due to error");
//   }
  
//   return result;
// };

// export const restorePurchases = async (): Promise<{
//   tier: SubscriptionTier;
//   activeProductId: string | null;
// }> => {
//   if (Platform.OS === "web")
//     return { tier: SubscriptionTier.FREE, activeProductId: null };

//   try {
//     const customerInfo = await Purchases.restorePurchases();
//     return {
//       tier: determineTierFromInfo(customerInfo),
//       activeProductId: determineActiveProductId(customerInfo),
//     };
//   } catch (error) {
//     console.error("Restore Error:", error);
//     return { tier: SubscriptionTier.FREE, activeProductId: null };
//   }
// };

// const openSubscriptionSettings = () => {
//   if (Platform.OS === "ios") {
//     Linking.openURL("https://apps.apple.com/account/subscriptions");
//   } else {
//     Linking.openURL("https://play.google.com/store/account/subscriptions");
//   }
// };

// export const purchaseSubscription = async (
//   tier: SubscriptionTier,
//   cycle: "MONTHLY" | "YEARLY",
// ): Promise<{
//   success: boolean;
//   newTier?: SubscriptionTier;
//   activeProductId?: string | null;
//   error?: string;
//   actionTaken?: "PURCHASE" | "REDIRECT";
// }> => {
//   if (Platform.OS === "web") {
//     alert("Purchases are not supported on web.");
//     return { success: false };
//   }

//   try {
//     const currentInfo = await Purchases.getCustomerInfo();
//     const currentTier = determineTierFromInfo(currentInfo);

//     if (TIER_WEIGHTS[currentTier] > TIER_WEIGHTS[tier]) {
//       openSubscriptionSettings();
//       return {
//         success: false,
//         error: "Redirecting to system settings for downgrade.",
//         actionTaken: "REDIRECT",
//       };
//     }

//     const offerings = await Purchases.getOfferings();
//     let identifier = "";

//     if (tier === SubscriptionTier.PLUS) {
//       identifier =
//         cycle === "MONTHLY"
//           ? "pkg_traders_ai_plus_monthly"
//           : "pkg_traders_ai_plus_yearly";
//     } else if (tier === SubscriptionTier.PRO) {
//       identifier =
//         cycle === "MONTHLY"
//           ? "pkg_traders_ai_pro_monthly"
//           : "pkg_traders_ai_pro_yearly";
//     }

//     const packageToBuy = offerings.current?.availablePackages.find(
//       (pkg) => pkg.identifier === identifier,
//     );

//     let transactionInfo;

//     // --- UPDATED PURCHASE LOGIC ---
//     if (packageToBuy) {
//       // 1. If RevenueCat package exists, use it
//       transactionInfo = await Purchases.purchasePackage(packageToBuy);
//     } else {
//       // 2. If RevenueCat package is missing (Review Mode), use Direct Product ID
//       console.log("Buying via fallback Product ID...");
      
//       // Map Package Identifier to Apple Product ID
//       // MAKE SURE THESE MATCH YOUR APP STORE CONNECT IDs EXACTLY
//       let appleProductId = identifier.replace("pkg_", ""); 
      
//       transactionInfo = await Purchases.purchaseStoreProduct({
//         identifier: appleProductId,
//         productCategory: "SUBSCRIPTION"
//       } as any);
//     }

//     const { customerInfo, productIdentifier } = transactionInfo;

//     const newTier = determineTierFromInfo(customerInfo);
//     let activeId = determineActiveProductId(customerInfo);

//     if (!activeId || (newTier === tier && activeId !== productIdentifier)) {
//       activeId = productIdentifier;
//     }

//     const isSuccess =
//       newTier === tier ||
//       (tier === SubscriptionTier.PLUS && newTier === SubscriptionTier.PRO);

//     return {
//       success: isSuccess,
//       newTier,
//       activeProductId: activeId,
//       actionTaken: "PURCHASE",
//     };
//   } catch (error: any) {
//     if (error.userCancelled) {
//       return { success: false };
//     }

//     if (error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
//       const restoreResult = await restorePurchases();
//       return {
//         success: true,
//         newTier: restoreResult.tier,
//         activeProductId: restoreResult.activeProductId,
//         actionTaken: "PURCHASE",
//       };
//     }

//     console.error("Purchase Error:", error);
//     return { success: false, error: error.message };
//   }
// };

// export const purchaseCredits = async (packId: string): Promise<boolean> => {
//   if (Platform.OS === "web") return false;

//   try {
//     const offerings = await Purchases.getOfferings();
//     const packageToBuy = offerings.current?.availablePackages.find(
//       (p) => p.identifier === packId,
//     );

//     if (!packageToBuy) throw new Error("Credit pack not found");

//     await Purchases.purchasePackage(packageToBuy);
//     return true;
//   } catch (error: any) {
//     if (!error.userCancelled) {
//       console.error("Credit Purchase Error:", error);
//     }
//   }
//   return false;
// };

// export const getActivePlanExpiration = async (): Promise<string | null> => {
//   if (Platform.OS === "web") return null;
//   try {
//     const customerInfo = await Purchases.getCustomerInfo();
//     const activeEntitlement =
//       customerInfo.entitlements.active["pro_access"] ||
//       customerInfo.entitlements.active["plus_access"];

//     if (activeEntitlement && activeEntitlement.expirationDate) {
//       return activeEntitlement.expirationDate;
//     }
//   } catch (e) {
//     console.error("Error fetching expiration:", e);
//   }
//   return null;
// };






// /Users/khuzaima/Desktop/TradersiOS/services/iapService.ts

import { Linking, Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PACKAGE_TYPE, 
  PURCHASES_ERROR_CODE,
  PurchasesPackage,
  PurchasesStoreProduct,
} from "react-native-purchases";
import { SubscriptionTier } from "../types";

const API_KEYS = {
  ios: "appl_VaWLLyYXCEMahgcYiyancmvRFfe",
  android: "goog_qVyMZdgdTHmyHYlrpbVNoQHaFPL",
};

export const FALLBACK_PRICES = {
  PLUS: {
    MONTHLY: "$29.99",
    YEARLY: "$299.99",
  },
  PRO: {
    MONTHLY: "$49.99",
    YEARLY: "$499.99",
  },
};

const ENTITLEMENTS = {
  PLUS: "plus_access",
  PRO: "pro_access",
};

const TIER_WEIGHTS = {
  [SubscriptionTier.FREE]: 0,
  [SubscriptionTier.PLUS]: 1,
  [SubscriptionTier.PRO]: 2,
};

export interface IAPPackages {
  plusMonthly: PurchasesPackage | null;
  plusYearly: PurchasesPackage | null;
  proMonthly: PurchasesPackage | null;
  proYearly: PurchasesPackage | null;
}

export const debugEntitlements = async () => {
  try {
    const info = await Purchases.getCustomerInfo();
  } catch (e) {}
};

export const initializeIAP = async (userId: string) => {
  if (Platform.OS === "web") return;

  try {
    await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    let isConfigured = false;
    try {
      isConfigured = await Purchases.isConfigured();
    } catch (e) {}

    if (isConfigured) {
      const info = await Purchases.getCustomerInfo();

      if (info.originalAppUserId === userId) {
        return;
      }

      await Purchases.logIn(userId);
      return;
    }

    if (Platform.OS === "ios") {
      await Purchases.configure({ apiKey: API_KEYS.ios, appUserID: userId });
    } else if (Platform.OS === "android") {
      await Purchases.configure({
        apiKey: API_KEYS.android,
        appUserID: userId,
      });
    }
  } catch (error: any) {
    if (
      error.code ===
      Purchases.PURCHASES_ERROR_CODE.OPERATION_ALREADY_IN_PROGRESS_ERROR
    ) {
      return;
    }
    console.error("IAP Init Error:", error);
  }
};

export const determineTierFromInfo = (info: CustomerInfo): SubscriptionTier => {
  if (info.entitlements.active[ENTITLEMENTS.PRO]) {
    return SubscriptionTier.PRO;
  } else if (info.entitlements.active[ENTITLEMENTS.PLUS]) {
    return SubscriptionTier.PLUS;
  }
  return SubscriptionTier.FREE;
};

export const determineActiveProductId = (info: CustomerInfo): string | null => {
  if (info.entitlements.active[ENTITLEMENTS.PRO]) {
    return info.entitlements.active[ENTITLEMENTS.PRO].productIdentifier;
  } else if (info.entitlements.active[ENTITLEMENTS.PLUS]) {
    return info.entitlements.active[ENTITLEMENTS.PLUS].productIdentifier;
  }
  return null;
};

export const getCurrentActiveProductId = async (): Promise<string | null> => {
  if (Platform.OS === "web") return null;
  try {
    const info = await Purchases.getCustomerInfo();
    return determineActiveProductId(info);
  } catch (error) {
    return null;
  }
};

export const getSubscriptionStatus = async (): Promise<SubscriptionTier> => {
  if (Platform.OS === "web") return SubscriptionTier.FREE;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return determineTierFromInfo(customerInfo);
  } catch (error) {
    console.error("Error checking subscription:", error);
    return SubscriptionTier.FREE;
  }
};

export const listenToCustomerInfoChanges = (
  onInfoUpdate: (tier: SubscriptionTier) => void,
) => {
  if (Platform.OS === "web") return () => {};

  const listener = (info: CustomerInfo) => {
    const newTier = determineTierFromInfo(info);
    onInfoUpdate(newTier);
  };

  Purchases.addCustomerInfoUpdateListener(listener);

  return () => {
    try {
      Purchases.removeCustomerInfoUpdateListener(listener);
    } catch (e) {}
  };
};

// --- HELPER: Create Package from Hardcoded Price ---
const createFallbackPackage = (
  id: string, 
  appleProductId: string, 
  priceWithText: string, 
  title: string,
  type: PACKAGE_TYPE
): PurchasesPackage => {
  // Extract clean price string (remove " / month")
  const priceString = priceWithText.split(" /")[0]; 

  // Force cast as PurchasesPackage to satisfy missing properties like 'presentedOfferingContext'
  return {
    identifier: id,
    packageType: type,
    product: {
      identifier: appleProductId,
      title: title,
      description: "Unlock access", 
      price: 0, 
      priceString: priceString, 
      currencyCode: "USD",
      introPrice: null,
      discounts: [],
      subscriptionPeriod: "P1M",
    } as unknown as PurchasesStoreProduct,
    offeringIdentifier: "fallback",
    presentedOfferingContext: { offeringIdentifier: "fallback" } // Mock context
  } as unknown as PurchasesPackage;
};

export const getAppOfferings = async (): Promise<IAPPackages> => {
  // Initialize with FALLBACK values immediately
  let result: IAPPackages = {
    plusMonthly: createFallbackPackage(
      "pkg_traders_ai_plus_monthly", 
      "traders_ai_plus_monthly", 
      FALLBACK_PRICES.PLUS.MONTHLY, 
      "Plus Monthly",
      PACKAGE_TYPE.MONTHLY
    ),
    plusYearly: createFallbackPackage(
      "pkg_traders_ai_plus_yearly", 
      "traders_ai_plus_yearly", 
      FALLBACK_PRICES.PLUS.YEARLY, 
      "Plus Yearly",
      PACKAGE_TYPE.ANNUAL
    ),
    proMonthly: createFallbackPackage(
      "pkg_traders_ai_pro_monthly", 
      "traders_ai_pro_monthly", 
      FALLBACK_PRICES.PRO.MONTHLY, 
      "Pro Monthly",
      PACKAGE_TYPE.MONTHLY
    ),
    proYearly: createFallbackPackage(
      "pkg_traders_ai_pro_yearly", 
      "traders_ai_pro_yearly", 
      FALLBACK_PRICES.PRO.YEARLY, 
      "Pro Yearly",
      PACKAGE_TYPE.ANNUAL
    ),
  };

  if (Platform.OS === "web") return result;

  try {
    const offerings = await Purchases.getOfferings();

    if (offerings.current && offerings.current.availablePackages.length > 0) {
      const avail = offerings.current.availablePackages;

      // Overwrite fallback with REAL data if available
      const realPlusMonthly = avail.find((p) => p.identifier === "pkg_traders_ai_plus_monthly");
      const realPlusYearly = avail.find((p) => p.identifier === "pkg_traders_ai_plus_yearly");
      const realProMonthly = avail.find((p) => p.identifier === "pkg_traders_ai_pro_monthly");
      const realProYearly = avail.find((p) => p.identifier === "pkg_traders_ai_pro_yearly");

      if (realPlusMonthly) result.plusMonthly = realPlusMonthly;
      if (realPlusYearly) result.plusYearly = realPlusYearly;
      if (realProMonthly) result.proMonthly = realProMonthly;
      if (realProYearly) result.proYearly = realProYearly;
    }
  } catch (e) {
    console.log("Using fallback prices due to error");
  }
  
  return result;
};

export const restorePurchases = async (): Promise<{
  tier: SubscriptionTier;
  activeProductId: string | null;
}> => {
  if (Platform.OS === "web")
    return { tier: SubscriptionTier.FREE, activeProductId: null };

  try {
    const customerInfo = await Purchases.restorePurchases();
    return {
      tier: determineTierFromInfo(customerInfo),
      activeProductId: determineActiveProductId(customerInfo),
    };
  } catch (error) {
    console.error("Restore Error:", error);
    return { tier: SubscriptionTier.FREE, activeProductId: null };
  }
};

const openSubscriptionSettings = () => {
  if (Platform.OS === "ios") {
    Linking.openURL("https://apps.apple.com/account/subscriptions");
  } else {
    Linking.openURL("https://play.google.com/store/account/subscriptions");
  }
};

export const purchaseSubscription = async (
  tier: SubscriptionTier,
  cycle: "MONTHLY" | "YEARLY",
): Promise<{
  success: boolean;
  newTier?: SubscriptionTier;
  activeProductId?: string | null;
  error?: string;
  actionTaken?: "PURCHASE" | "REDIRECT";
}> => {
  if (Platform.OS === "web") {
    alert("Purchases are not supported on web.");
    return { success: false };
  }

  try {
    const currentInfo = await Purchases.getCustomerInfo();
    const currentTier = determineTierFromInfo(currentInfo);

    if (TIER_WEIGHTS[currentTier] > TIER_WEIGHTS[tier]) {
      openSubscriptionSettings();
      return {
        success: false,
        error: "Redirecting to system settings for downgrade.",
        actionTaken: "REDIRECT",
      };
    }

    const offerings = await Purchases.getOfferings();
    let identifier = "";

    if (tier === SubscriptionTier.PLUS) {
      identifier =
        cycle === "MONTHLY"
          ? "pkg_traders_ai_plus_monthly"
          : "pkg_traders_ai_plus_yearly";
    } else if (tier === SubscriptionTier.PRO) {
      identifier =
        cycle === "MONTHLY"
          ? "pkg_traders_ai_pro_monthly"
          : "pkg_traders_ai_pro_yearly";
    }

    const packageToBuy = offerings.current?.availablePackages.find(
      (pkg) => pkg.identifier === identifier,
    );

    let transactionInfo;

    // --- UPDATED PURCHASE LOGIC ---
    if (packageToBuy) {
      // 1. If RevenueCat package exists, use it
      transactionInfo = await Purchases.purchasePackage(packageToBuy);
    } else {
      // 2. If RevenueCat package is missing (Review Mode), use Direct Product ID
      console.log("Buying via fallback Product ID...");
      
      // Map Package Identifier to Apple Product ID
      // IMPORTANT: Remove 'pkg_' if your Apple ID doesn't have it
      let appleProductId = identifier.replace("pkg_", ""); 
      
      transactionInfo = await Purchases.purchaseStoreProduct({
        identifier: appleProductId,
        productCategory: "SUBSCRIPTION"
      } as any);
    }

    const { customerInfo, productIdentifier } = transactionInfo;

    const newTier = determineTierFromInfo(customerInfo);
    let activeId = determineActiveProductId(customerInfo);

    if (!activeId || (newTier === tier && activeId !== productIdentifier)) {
      activeId = productIdentifier;
    }

    const isSuccess =
      newTier === tier ||
      (tier === SubscriptionTier.PLUS && newTier === SubscriptionTier.PRO);

    return {
      success: isSuccess,
      newTier,
      activeProductId: activeId,
      actionTaken: "PURCHASE",
    };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false };
    }

    if (error.code === PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR) {
      const restoreResult = await restorePurchases();
      return {
        success: true,
        newTier: restoreResult.tier,
        activeProductId: restoreResult.activeProductId,
        actionTaken: "PURCHASE",
      };
    }

    console.error("Purchase Error:", error);
    return { success: false, error: error.message };
  }
};

export const purchaseCredits = async (packId: string): Promise<boolean> => {
  if (Platform.OS === "web") return false;

  try {
    const offerings = await Purchases.getOfferings();
    const packageToBuy = offerings.current?.availablePackages.find(
      (p) => p.identifier === packId,
    );

    if (!packageToBuy) throw new Error("Credit pack not found");

    await Purchases.purchasePackage(packageToBuy);
    return true;
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error("Credit Purchase Error:", error);
    }
  }
  return false;
};

export const getActivePlanExpiration = async (): Promise<string | null> => {
  if (Platform.OS === "web") return null;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const activeEntitlement =
      customerInfo.entitlements.active["pro_access"] ||
      customerInfo.entitlements.active["plus_access"];

    if (activeEntitlement && activeEntitlement.expirationDate) {
      return activeEntitlement.expirationDate;
    }
  } catch (e) {
    console.error("Error fetching expiration:", e);
  }
  return null;
};