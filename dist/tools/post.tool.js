import { z } from "zod";
import { getPostsByUser } from "../services/post.service.js";
export const getPostsTool = {
    name: "get_posts_by_user",
    description: "Fetch posts for a user (limited and cleaned)",
    inputSchema: {
        userId: z.number(),
    },
    handler: async ({ userId }) => {
        try {
            const posts = await getPostsByUser(userId);
            // IMPORTANT: control noise
            const cleaned = posts.slice(0, 3).map((post) => ({
                id: post.id,
                title: post.title,
            }));
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(cleaned),
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Failed to fetch posts",
                    },
                ],
            };
        }
    },
};
//# sourceMappingURL=post.tool.js.map