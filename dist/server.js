import http from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getUserTool } from "./tools/user.tool.js";
import { getPostsTool } from "./tools/post.tool.js";
import { getSecureDataTool } from "./tools/secure.tool.js";
import { randomUUID } from "node:crypto";
function createServer() {
    const server = new McpServer({
        name: "api-wrapper-mcp",
        version: "1.0.0",
    });
    server.registerTool(getUserTool.name, {
        description: getUserTool.description,
        inputSchema: getUserTool.inputSchema,
    }, getUserTool.handler);
    server.registerTool(getPostsTool.name, {
        description: getPostsTool.description,
        inputSchema: getPostsTool.inputSchema,
    }, getPostsTool.handler);
    server.registerTool(getSecureDataTool.name, {
        description: getSecureDataTool.description,
        inputSchema: getSecureDataTool.inputSchema,
    }, getSecureDataTool.handler);
    return server;
}
async function startServer() {
    const PORT = process.env.PORT || 3000;
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
    });
    await server.connect(transport);
    const httpServer = http.createServer((req, res) => {
        if (req.url === "/health" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
            return;
        }
        if (req.url === "/mcp") {
            transport.handleRequest(req, res).catch((error) => {
                console.error("MCP error:", error);
                if (!res.headersSent) {
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({
                        error: error instanceof Error
                            ? error.message
                            : "Internal Server Error",
                    }));
                }
            });
            return;
        }
        res.writeHead(404);
        res.end();
    });
    httpServer.listen(PORT, () => {
        console.log(`MCP HTTP server running on port ${PORT}`);
    });
}
startServer();
//# sourceMappingURL=server.js.map