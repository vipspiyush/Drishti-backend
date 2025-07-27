import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize only once
const app = getApps().length === 0 ? initializeApp() : getApp();

const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
