import { z } from "zod";
import { getUser } from "../services/user.service.js";

export const getUserTool = {
  name: "get_user",
  description: "Fetch user details by ID",

  inputSchema: {
    userId: z.number(),
  },

  handler: async ({ userId }: { userId: number }) => {
    try {
      const user = await getUser(userId);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              id: user.id,
              name: user.name,
              email: user.email,
            }),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Failed to fetch user",
          },
        ],
      };
    }
  },
};
