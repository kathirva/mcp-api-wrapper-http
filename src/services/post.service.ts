import { httpClient } from "./http.client.js";

export async function getPostsByUser(userId: number) {
  const response = await httpClient.get(`/posts`, {
    params: { userId },
  });

  return response.data;
}
