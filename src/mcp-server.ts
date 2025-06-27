import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { setupRedditResources } from "./reddit/resources.js";
import { setupRedditTools } from "./reddit/tools.js";
import { setupRedditPrompts } from "./reddit/prompts.js";
/**
 * Creates and configures the Reddit MCP server instance
 */
export function createMCPServer(): McpServer {
  const serverName = process.env.MCP_SERVER_NAME || "reddit-mcp";
  const serverVersion = process.env.MCP_SERVER_VERSION || "1.0.0";
  
  // Create the MCP server instance
  const server = new McpServer({
    name: serverName,
    version: serverVersion
  });
  
  // Register Reddit capabilities
  setupRedditResources(server);
  setupRedditTools(server);
  setupRedditPrompts(server);
  
  return server;
}