import http from "http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { getUserTool } from "./tools/user.tool.js";
import { getPostsTool } from "./tools/post.tool.js";
import { getSecureDataTool } from "./tools/secure.tool.js";

const server = new McpServer({
  name: "api-wrapper-mcp",
  version: "1.0.0",
});

// Tool 1
server.registerTool(
  getUserTool.name,
  {
    description: getUserTool.description,
    inputSchema: getUserTool.inputSchema,
  },
  getUserTool.handler
);

// Tool 2
server.registerTool(
  getPostsTool.name,
  {
    description: getPostsTool.description,
    inputSchema: getPostsTool.inputSchema,
  },
  getPostsTool.handler
);

// Tool 3
server.registerTool(
  getSecureDataTool.name,
  {
    description: getSecureDataTool.description,
    inputSchema: getSecureDataTool.inputSchema,
  },
  getSecureDataTool.handler
);

const app = express();

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport as Parameters<typeof server.connect>[0]);

  const PORT = process.env.PORT || 3000;

  const serverHttp = http.createServer((req, res) => {
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }

    if (req.url === "/mcp" && req.method === "POST") {
      transport.handleRequest(req, res).catch((error: unknown) => {
        console.error("MCP request error:", error);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error:
                error instanceof Error
                  ? error.message
                  : "Internal Server Error",
            })
          );
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
