import { readFile } from "fs/promises";
import { PredictionServiceClient } from "@google-cloud/aiplatform";

// Replace with your actual details
const project = "my-app-2a291";
const location = "us-central1";
const endpointId = "1022243448134041600";

// Initialize the client with API endpoint
const client = new PredictionServiceClient({
  apiEndpoint: `${location}-aiplatform.googleapis.com`,
});

export async function predictCrowdDensity(imagePath: string) {
  const imageBuffer = await readFile(imagePath);
  const base64Image = imageBuffer.toString("base64");

  // Use `any` to bypass TS's strict IValue typing
  const instance: any = {
    content: base64Image,
  };

  const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;

  try {
    const result = await client.predict({
      endpoint,
      instances: [instance],
    });

    const predictions = result[0]?.predictions ?? [];
    console.log("✅ Predictions:", predictions);
    return predictions;
  } catch (err) {
    console.error("❌ Vertex AI prediction error:", err);
    throw err;
  }
}
