import { httpClient } from "./http.client.js";
export async function getPostsByUser(userId) {
    const response = await httpClient.get(`/posts`, {
        params: { userId },
    });
    return response.data;
}
//# sourceMappingURL=post.service.js.map