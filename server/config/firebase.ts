import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Check if Firebase is properly configured
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "stoik-inventory",
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

let isFirebaseAvailable = false;
let db: any = null;

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    if (
      firebaseConfig.privateKey &&
      firebaseConfig.clientEmail &&
      firebaseConfig.projectId
    ) {
      initializeApp({
        credential: cert(firebaseConfig),
        projectId: firebaseConfig.projectId,
      });
      db = getFirestore();
      isFirebaseAvailable = true;
      console.log("✅ Firebase initialized successfully");
    } else {
      console.log("⚠️  Firebase credentials not found, using mock data");
      isFirebaseAvailable = false;
    }
  } catch (error) {
    console.error("❌ Firebase initialization error:", error.message);
    isFirebaseAvailable = false;
  }
}

export { db, isFirebaseAvailable };

// Collection names
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  CUSTOMERS: "customers",
  SETTINGS: "settings",
  ANALYTICS: "analytics",
} as const;
