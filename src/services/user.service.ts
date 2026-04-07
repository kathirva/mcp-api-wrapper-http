import { httpClient } from "./http.client.js";

export async function getUser(userId: number) {
  const response = await httpClient.get(`/users/${userId}`);
  return response.data;
}
