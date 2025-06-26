import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { setupRedditResource } from "./reddit/resource.js";
import { setupRedditTools } from "./reddit/tools.js";
export function createMCPServer(): McpServer {
  const serverName = process.env.MCP_SERVER_NAME || "reddit-mcp";
  const serverVersion = process.env.MCP_SERVER_VERSION || "1.0.0";
  
  const server = new McpServer({
    name: serverName,
    version: serverVersion
  });
  
  setupRedditResource(server);
  setupRedditTools(server);
  
  return server;
}