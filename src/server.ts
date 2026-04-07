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
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  const transport = new StreamableHTTPServerTransport();
  await server.connect(transport as Parameters<typeof server.connect>[0]);

  app.post("/mcp", async (req, res) => {
    try {
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP request error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          error: error instanceof Error ? error.message : "Internal Server Error",
        });
      }
    }
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`MCP HTTP server running on port ${PORT}`);
  });
}

startServer();
