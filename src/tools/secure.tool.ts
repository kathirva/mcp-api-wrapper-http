import { z } from "zod";
import { verifyToken } from "../utils/auth.js";

export const getSecureDataTool = {
  name: "get_secure_data",
  description: "Fetch protected data using JWT token",

  inputSchema: {
    token: z.string(),
  },

  handler: async ({ token }: { token: string }) => {
    try {
      const decoded = verifyToken(token);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              message: "Access granted",
              user: decoded,
              data: "Sensitive information here",
            }),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Unauthorized: " + error.message,
          },
        ],
      };
    }
  },
};
