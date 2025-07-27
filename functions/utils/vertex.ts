import axios from "axios";

export async function predictFromVertexAI(base64Image: string) {
  const endpoint = "https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/locations/us-central1/endpoints/ENDPOINT_ID:predict";

  const response = await axios.post(endpoint, {
    instances: [{ b64: base64Image }],
  }, {
    headers: {
      Authorization: `Bearer ${process.env.VERTEX_AI_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  return response.data.predictions[0];
}