import { onRequest } from "firebase-functions/v2/https";

export const forecastBottleneck = onRequest(async (_req, res) => {
  // Placeholder logic
  res.json({ forecast: "No bottlenecks in next 30 mins." });
});