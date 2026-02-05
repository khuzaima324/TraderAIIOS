import firestore from "@react-native-firebase/firestore";
import { HistoryItem } from "../types";

export const addToHistory = async (
  userId: string,
  item: Partial<HistoryItem>,
) => {
  try {
    await firestore()
      .collection("users")
      .doc(userId)
      .collection("history")
      .add({
        ...item,
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error("Error adding to history:", error);
    throw error;
  }
};

export const removeFromHistory = async (userId: string, itemId: string) => {
  try {
    await firestore()
      .collection("users")
      .doc(userId)
      .collection("history")
      .doc(itemId)
      .delete();
  } catch (error) {
    console.error("Error removing history item:", error);
  }
};

export const subscribeToHistory = (
  userId: string,
  callback: (data: HistoryItem[]) => void,
) => {
  const unsubscribe = firestore()
    .collection("users")
    .doc(userId)
    .collection("history")
    .orderBy("timestamp", "desc")
    .onSnapshot((snapshot) => {
      const items = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toMillis
            ? data.timestamp.toMillis()
            : Date.now(),
        };
      }) as HistoryItem[];

      callback(items);
    });

  return unsubscribe;
};