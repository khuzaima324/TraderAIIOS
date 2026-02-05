import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

export const db = firestore();
export { auth };

GoogleSignin.configure({
  webClientId:
    "1036296914296-ro11i6c8r45otstjc69plv2rc81cad7a.apps.googleusercontent.com",
  offlineAccess: true,
});

export const subscribeToAuthChanges = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
) => {
  return auth().onAuthStateChanged(callback);
};

export const signUpWithEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      pass,
    );
    await userCredential.user.sendEmailVerification();
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, pass);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();

    const response = await GoogleSignin.signIn();

    // const idToken = response.data?.idToken;
    const idToken = response.idToken;

    if (!idToken) {
      throw new Error("No ID token found");
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    return await auth().signInWithCredential(googleCredential);
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("User cancelled the login flow");
      return null;
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error("Sign in is already in progress");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error("Play services not available or outdated");
    } else {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  }
};

export const resetPassword = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    throw error;
  }
};

export const resendVerificationEmail = async (user: FirebaseAuthTypes.User) => {
  try {
    await user.sendEmailVerification();
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
  } catch (error) {
    console.error("Logout Error:", error);
    await auth().signOut();
  }
};

export const updateUserPassword = async (
  currentPass: string,
  newPass: string,
) => {
  const user = auth().currentUser;
  if (!user || !user.email) throw new Error("No user logged in.");

  try {
    const credential = auth.EmailAuthProvider.credential(
      user.email,
      currentPass,
    );
    await user.reauthenticateWithCredential(credential);
    await user.updatePassword(newPass);
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  try {
    await firestore().collection("users").doc(uid).set(data, { merge: true });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getFriendlyErrorMessage = (error: any) => {
  const code = error.code;
  const msg = error.message;

  if (code === "auth/email-already-in-use")
    return "This email is already associated with an account. Please log in.";
  if (code === "auth/invalid-email")
    return "Please enter a valid email address.";
  if (code === "auth/user-not-found")
    return "No account found with this email. Please sign up.";
  if (code === "auth/wrong-password")
    return "Incorrect password. Please try again.";
  if (code === "auth/invalid-credential")
    return "Invalid credentials. Please try again.";
  if (code === "auth/weak-password")
    return "Password should be at least 6 characters.";
  if (code === "auth/too-many-requests")
    return "Too many failed attempts. Please try again later.";

  return msg || "An unexpected error occurred. Please try again.";
};