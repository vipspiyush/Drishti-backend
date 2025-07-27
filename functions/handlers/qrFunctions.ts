import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import generateQR from "../utils/qrGenerator.js";

import { getFirestore } from "firebase-admin/firestore";
const db = getFirestore();

// Register a user and generate QR URL
export const registerUser = onRequest(
  {
    memory: "512MiB",
    timeoutSeconds: 60
  },
  async (req, res) => {
    try {
      const { name, email } = req.body;

      console.log("Registering user:", { name, email });

      if (!name || !email)
        throw new HttpsError("invalid-argument", "Missing name or email");

      const qrId = "UID" + Date.now();

      await db.collection("users").doc(qrId).set({
        name,
        email,
        qrId,
        registeredAt: admin.firestore.Timestamp.now(),
      });

      const qrUrl = generateQR(qrId);
      res.status(200).json({ qrId, qrUrl }); // <-- FIXED
    } catch (error) {
      console.error("Error in registerUser:", error);
      throw new HttpsError("internal", "Something went wrong");
    }
  }
);

// Scan a QR code
export const scanQR = onCall(
  {
    memory: "512MiB",       // Increased memory
    timeoutSeconds: 60      // Optional: can adjust
  },
  async (request) => {

    const { qrId, location, status } = request.data || {};

    if (!qrId || !location || !status) {
      throw new Error("Missing fields: qrId, location or status");
    }

    await db.collection("scans").add({
      qrId,
      location,
      status,
      time: admin.firestore.Timestamp.now(),
    });

    return { success: true };
  }
);

// Report a lost item
export const reportItem = onCall(async (data: any, context) => {
  const description = data?.description;
  const qrId = data?.qrId;

  if (!description || !qrId) throw new Error("Missing fields");

  const docRef = await db.collection("lostItems").add({
    description,
    assignedToQR: qrId,
    foundAt: admin.firestore.Timestamp.now(),
    isClaimed: false,
  });

  return { success: true, itemId: docRef.id };
});
