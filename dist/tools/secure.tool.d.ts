import { z } from "zod";
export declare const getSecureDataTool: {
    name: string;
    description: string;
    inputSchema: {
        token: z.ZodString;
    };
    handler: ({ token }: {
        token: string;
    }) => Promise<{
        content: {
            type: "text";
            text: string;
        }[];
    }>;
};
//# sourceMappingURL=secure.tool.d.ts.map