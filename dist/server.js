import http from "http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { getUserTool } from "./tools/user.tool.js";
import { getPostsTool } from "./tools/post.tool.js";
import { getSecureDataTool } from "./tools/secure.tool.js";
function createMcpServer() {
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
const transports = {};
function getSessionId(headerValue) {
    if (!headerValue)
        return undefined;
    return Array.isArray(headerValue) ? headerValue[0] : headerValue;
}
// Health check
async function startServer() {
    const PORT = process.env.PORT || 3000;
    const serverHttp = http.createServer((req, res) => {
        if (req.url === "/health" && req.method === "GET") {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "ok" }));
            return;
        }
        if (req.url === "/mcp" && req.method === "POST") {
            const sessionId = getSessionId(req.headers["mcp-session-id"]);
            const chunks = [];
            req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            req.on("end", () => {
                let parsedBody;
                try {
                    const bodyString = Buffer.concat(chunks).toString("utf8");
                    parsedBody = bodyString ? JSON.parse(bodyString) : undefined;
                }
                catch {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({
                        jsonrpc: "2.0",
                        error: { code: -32700, message: "Parse error" },
                        id: null,
                    }));
                    return;
                }
                (async () => {
                    try {
                        let transport;
                        if (sessionId && transports[sessionId]) {
                            transport = transports[sessionId];
                        }
                        else if (!sessionId && isInitializeRequest(parsedBody)) {
                            const sessionServer = createMcpServer();
                            transport = new StreamableHTTPServerTransport({
                                sessionIdGenerator: () => randomUUID(),
                                onsessioninitialized: (newSessionId) => {
                                    transports[newSessionId] = transport;
                                },
                            });
                            transport.onclose = () => {
                                const closedSessionId = transport.sessionId;
                                if (closedSessionId) {
                                    delete transports[closedSessionId];
                                }
                            };
                            await sessionServer.connect(transport);
                        }
                        else if (!sessionId) {
                            const statelessServer = createMcpServer();
                            transport = new StreamableHTTPServerTransport();
                            await statelessServer.connect(transport);
                        }
                        else {
                            res.writeHead(400, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({
                                jsonrpc: "2.0",
                                error: {
                                    code: -32000,
                                    message: "Bad Request: invalid or missing MCP session",
                                },
                                id: null,
                            }));
                            return;
                        }
                        await transport.handleRequest(req, res, parsedBody);
                    }
                    catch (error) {
                        console.error("MCP request error:", error);
                        if (!res.headersSent) {
                            res.writeHead(500, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({
                                error: error instanceof Error
                                    ? error.message
                                    : "Internal Server Error",
                            }));
                        }
                    }
                })().catch((error) => {
                    console.error("MCP async handling error:", error);
                });
            });
            return;
        }
        if (req.url === "/mcp" && req.method === "GET") {
            const sessionId = getSessionId(req.headers["mcp-session-id"]);
            if (!sessionId || !transports[sessionId]) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Invalid or missing MCP session ID");
                return;
            }
            transports[sessionId].handleRequest(req, res).catch((error) => {
                console.error("MCP stream error:", error);
                if (!res.headersSent) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                }
            });
            return;
        }
        if (req.url === "/mcp" && req.method === "DELETE") {
            const sessionId = getSessionId(req.headers["mcp-session-id"]);
            if (!sessionId || !transports[sessionId]) {
                res.writeHead(400, { "Content-Type": "text/plain" });
                res.end("Invalid or missing MCP session ID");
                return;
            }
            transports[sessionId].handleRequest(req, res).catch((error) => {
                console.error("MCP session close error:", error);
                if (!res.headersSent) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                }
            });
            return;
        }
        res.writeHead(404);
        res.end();
    });
    serverHttp.listen(PORT, () => {
        console.log(`MCP HTTP server running on port ${PORT}`);
    });
}
startServer();
//# sourceMappingURL=server.js.map