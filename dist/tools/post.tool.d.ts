import { z } from "zod";
export declare const getPostsTool: {
    name: string;
    description: string;
    inputSchema: {
        userId: z.ZodNumber;
    };
    handler: ({ userId }: {
        userId: number;
    }) => Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=post.tool.d.ts.map