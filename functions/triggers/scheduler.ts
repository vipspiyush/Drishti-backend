import { onSchedule } from "firebase-functions/v2/scheduler";
import { extractFrameFromVideo } from "../utils/frameProcessor.js";

export const scheduledFrameProcessing = onSchedule("every 15 minutes", async () => {
  const videoGCSUri = "gs://vipspiyush/test-videos/test1.mp4";
  await extractFrameFromVideo(videoGCSUri);
});
