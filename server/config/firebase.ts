import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Initialize Firebase Admin
const firebaseConfig = {
  // You'll need to replace these with your actual Firebase config
  projectId: process.env.FIREBASE_PROJECT_ID || "stoik-inventory",
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    if (firebaseConfig.privateKey && firebaseConfig.clientEmail) {
      initializeApp({
        credential: cert(firebaseConfig),
        projectId: firebaseConfig.projectId,
      });
    } else {
      // For development, use emulator or default credentials
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

export const db = getFirestore();

// Collection names
export const COLLECTIONS = {
  PRODUCTS: "products",
  ORDERS: "orders",
  CUSTOMERS: "customers",
  SETTINGS: "settings",
  ANALYTICS: "analytics",
} as const;
