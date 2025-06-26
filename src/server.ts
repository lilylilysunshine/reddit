import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createMCPServer } from "./mcp-server.js";
import type { Request, Response } from "express";
dotenv.config();
const app = express();
const PORT = parseInt(process.env.PORT || "3000");
app.use(cors());
app.use(express.json());
const transports: Record<string, StreamableHTTPServerTransport> = {};
app.post('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;
  try {
    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports[newSessionId] = transport;
        }
      });
      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };
      const server = createMCPServer();
      await server.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided or not an initialization request',
        },
        id: null,
      });
      return;
    }
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    server: 'reddit-mcp',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
app.listen(PORT, () => {
  console.log(`🚀 Reddit MCP Server running on port ${PORT}`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
});