import AsyncStorage from "@react-native-async-storage/async-storage";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useRouter, useSegments } from "expo-router";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  View,
} from "react-native";
import {
  getSubscriptionStatus,
  initializeIAP,
  listenToCustomerInfoChanges,
} from "../services/iapService";
import { initPushNotifications } from "../services/pushService";
import { SubscriptionTier } from "../types";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  subscriptionTier: SubscriptionTier;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  subscriptionTier: SubscriptionTier.FREE,
  refreshSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>(
    SubscriptionTier.FREE,
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const appState = useRef(AppState.currentState);

  const syncTierWithDatabase = async (
    userId: string | undefined,
    tier: SubscriptionTier,
  ) => {
    if (!userId || !auth().currentUser) return;

    try {
      const userRef = firestore().collection("users").doc(userId);
      const snap = await userRef.get();

      if ((snap as any).exists) {
        const userData = snap.data();
        const currentDbTier = userData?.tier;

        if (currentDbTier !== tier) {
          await userRef.update({ tier: tier });
          console.log(`✅ Tier synced to DB: ${tier}`);
        }
      }
    } catch (error) {
      console.log("ℹ️ Database sync skipped or user logged out.");
    }
  };

  const refreshSubscription = async () => {
    console.log("🔄 Refreshing Subscription Status...");
    try {
      const status = await getSubscriptionStatus();
      setSubscriptionTier(status);

      const currentUser = auth().currentUser;
      if (currentUser) {
        await syncTierWithDatabase(currentUser.uid, status);
      }
    } catch (e) {
      console.log("⚠️ Failed to refresh subscription:", e);
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log(
          "📱 App has come to the foreground! Checking subscription...",
        );
        if (user) {
          refreshSubscription();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribeSnapshot = firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot(
        (doc) => {
          if ((doc as any).exists) {
            const data = doc.data();
            const dbTier = data?.tier as SubscriptionTier;

            setSubscriptionTier((current) => {
              if (dbTier && current !== dbTier) {
                console.log(`🔄 Real-time Update: Tier changed to ${dbTier}`);
                return dbTier;
              }
              return current;
            });
          }
        },
        (error) => console.log("⚠️ Real-time listener error:", error),
      );

    return () => unsubscribeSnapshot();
  }, [user]);

  useEffect(() => {
    let iapCleanup: (() => void) | undefined;

    // const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
    //   if (currentUser) {
    //     setUser(currentUser);
    //     await AsyncStorage.setItem("user_uid", currentUser.uid);

    //     initPushNotifications(currentUser.uid, (path) => {
    //       router.push(path as any);
    //     });

    //     await initializeIAP(currentUser.uid);

    //     await refreshSubscription();

    //     iapCleanup = listenToCustomerInfoChanges(async (newTier) => {
    //       if (auth().currentUser) {
    //         setSubscriptionTier(newTier);
    //         await syncTierWithDatabase(currentUser.uid, newTier);
    //       }
    //     });
    //   } else {
    //     if (iapCleanup) iapCleanup();
    //     setUser(null);
    //     setSubscriptionTier(SubscriptionTier.FREE);
    //     await AsyncStorage.removeItem("user_uid");
    //   }
    //   setIsLoading(false);
    // });

  const unsubscribe = auth().onAuthStateChanged(async (currentUser) => {
  try {
    if (currentUser) {
      setUser(currentUser);
      await AsyncStorage.setItem("user_uid", currentUser.uid);

      initPushNotifications(currentUser.uid, (path) => {
        router.push(path as any);
      });

      // fire and forget, DO NOT await
      initializeIAP(currentUser.uid).catch(() => {});
      refreshSubscription().catch(() => {});

      iapCleanup = listenToCustomerInfoChanges(async (newTier) => {
        if (auth().currentUser) {
          setSubscriptionTier(newTier);
          await syncTierWithDatabase(currentUser.uid, newTier);
        }
      });
    } else {
      if (iapCleanup) iapCleanup();
      setUser(null);
      setSubscriptionTier(SubscriptionTier.FREE);
      await AsyncStorage.removeItem("user_uid");
    }
  } finally {
    setIsLoading(false);
  }
});


    return () => {
      unsubscribe();
      if (iapCleanup) iapCleanup();
    };
  }, []);

  // useEffect(() => {
  //   if (isLoading) return;
  //   // const inAuthGroup = segments[0] === "(tabs)";
  //   const inTabs = segments.includes("(tabs)");

  //   if (!user && inTabs) {
  //     router.replace("/");
  //   } else if (user && !inta) {
  //     if (user.emailVerified) {
  //       router.replace("/(tabs)/analyzer");
  //     }
  //   }
  // }, [user, isLoading, segments]);

useEffect(() => {
  if (isLoading) return;

  const inTabs = segments.includes("(tabs)");
  
  // ONLY redirect to root if there is no user AND we are trying to access tabs
  if (!user && inTabs) {
    router.replace("/");
  } 
  // ONLY redirect to tabs if there IS a user AND we are stuck on the onboarding/login (root)
  else if (user?.emailVerified && !inTabs) {
    router.replace("/(tabs)/analyzer");
  }
}, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator size="large" color="#0A84FF" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, subscriptionTier, refreshSubscription }}
    >
      {children}
    </AuthContext.Provider>
  );
};