import { httpClient } from "./http.client.js";
export async function getUser(userId) {
    const response = await httpClient.get(`/users/${userId}`);
    return response.data;
}
//# sourceMappingURL=user.service.js.map