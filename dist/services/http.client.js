import axios from "axios";
export const httpClient = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
    timeout: 5000,
});
//# sourceMappingURL=http.client.js.map