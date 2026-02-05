import firestore from "@react-native-firebase/firestore";
import { TrackedAccount } from "../types";

export const addTrackerToCloud = async (
  userId: string,
  account: Partial<TrackedAccount>,
) => {
  try {
    await firestore()
      .collection("users")
      .doc(userId)
      .collection("trackers")
      .add({
        ...account,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error("Error adding tracker:", error);
    throw error;
  }
};

export const removeTrackerFromCloud = async (
  userId: string,
  trackerId: string,
) => {
  try {
    await firestore()
      .collection("users")
      .doc(userId)
      .collection("trackers")
      .doc(trackerId)
      .delete();
  } catch (error) {
    console.error("Error removing tracker:", error);
    throw error;
  }
};

export const subscribeToTrackers = (
  userId: string,
  callback: (data: TrackedAccount[]) => void,
) => {
  const unsubscribe = firestore()
    .collection("users")
    .doc(userId)
    .collection("trackers")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      const trackers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TrackedAccount[];

      callback(trackers);
    });

  return unsubscribe;
};