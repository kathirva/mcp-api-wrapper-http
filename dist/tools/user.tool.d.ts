import { z } from "zod";
export declare const getUserTool: {
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
//# sourceMappingURL=user.tool.d.ts.map