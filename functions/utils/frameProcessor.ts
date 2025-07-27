import { Storage } from "@google-cloud/storage";
import { exec } from "child_process";
import path from "path";
import fs from "fs";

const storage = new Storage();

export async function extractFrameFromVideo(gcsUri: string) {
  const localVideoPath = "/tmp/video.mp4";
  const localImagePath = "/tmp/frame.jpg";

  const [_, bucketName, ...fileParts] = gcsUri.split("/");
  const fileName = fileParts.join("/");

  const bucket = storage.bucket(bucketName);
  await bucket.file(fileName).download({ destination: localVideoPath });

  await new Promise((res, rej) => {
    exec(`ffmpeg -i ${localVideoPath} -ss 00:00:01.000 -vframes 1 ${localImagePath}`, (err) => {
      if (err) rej(err);
      else res(true);
    });
  });

  const frameBuffer = fs.readFileSync(localImagePath).toString("base64");
  return frameBuffer;
}