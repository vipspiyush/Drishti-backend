import { onObjectFinalized } from "firebase-functions/v2/storage";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { exec } from "child_process";
import { predictCrowdDensity } from "../handlers/predict.js";
import { chatWithAgent } from "../handlers/gemini.js";
import { storage } from "../src/index.js";

export const processVideo = onObjectFinalized(
  { bucket: "your-bucket-name" },
  async (event) => {
    const fileBucket = event.bucket;
    const filePath = event.data.name!;
    const fileName = path.basename(filePath);

    if (!fileName.endsWith(".mp4")) return;

    const bucket = storage.bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    await bucket.file(filePath).download({ destination: tempFilePath });

    const framesDir = path.join(os.tmpdir(), "frames_" + Date.now());
    fs.mkdirSync(framesDir);

    await new Promise<void>((resolve, reject) => {
      exec(`ffmpeg -i ${tempFilePath} -vf fps=1/5 ${framesDir}/frame_%03d.jpg`, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith(".jpg"));

    for (const file of frameFiles) {
      const fullPath = path.join(framesDir, file);
      await predictCrowdDensity(fullPath);
    }

    fs.rmSync(framesDir, { recursive: true });
    fs.unlinkSync(tempFilePath);
  }
);

// Export chatWithAgent if you want to expose it here
export { chatWithAgent };
