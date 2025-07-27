import * as logger from "firebase-functions/logger";
import fetch from "node-fetch";

const GEMINI_API_KEY = 'AIzaSyCBN8PDAYeGboiye-FwWWh5wAcm7EEWjwM';
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function chatWithAgent(analysisResults: any) {
  try {
    const prompt = `Analyze the following crowd analysis data and summarize the key insights:\n\n${JSON.stringify(analysisResults, null, 2)}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = (await response.json()) as {
      candidates?: Array<{
        content: {
          parts: Array<{ text: string }>
        }
      }>
    };

    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      logger.info("✅ Gemini Summary:", text);
      return text;
    } else {
      logger.warn("⚠️ No candidates returned from Gemini.");
      return null;
    }
  } catch (err) {
    logger.error("❌ Error communicating with Gemini:", err);
    throw err;
  }
}
