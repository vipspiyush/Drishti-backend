import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as logger from "firebase-functions/logger";
import { extractFrameFromVideo } from "../utils/frameProcessor.js";
import { chatWithAgent } from "../handlers/gemini.js";
import { db } from "../src/index.js";

export const onVideoUpload = onObjectFinalized(
  {
    region: "us-central1",
    memory: "512MiB",
    bucket: "my-app-2a291.firebasestorage.app",
  },
  async (event) => {
    const file = event.data;
    if (!file.name || !file.bucket) {
      logger.error("Uploaded file missing name or bucket.");
      return;
    }

    logger.info("🎥 File uploaded:", file.name);

    if (!file.contentType?.startsWith("video/")) {
      logger.info("❌ Not a video, skipping:", file.name);
      return;
    }

    const videoGCSUri = `gs://${file.bucket}/${file.name}`;
    logger.info("🔍 Extracting frames from:", videoGCSUri);

    try {
      const analysisResults = await extractFrameFromVideo(videoGCSUri);
      const geminiSummary = await chatWithAgent(analysisResults);

      await db.collection("videoSummaries").doc(file.name).set({
        videoName: file.name,
        videoPath: videoGCSUri,
        createdAt: Date.now(),
        summary: geminiSummary,
        rawAnalysis: analysisResults,
      });

      logger.info("✅ Summary and analysis stored in Firestore.");
    } catch (error) {
      logger.error("❌ Error processing video:", error);
    }
  }
);
