import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { setupMinimalResource } from "./minimal/resource.js";
import { setupMinimalTool } from "./minimal/tool.js";
import { setupMinimalPrompt } from "./minimal/prompt.js";
import { setupRedditTools } from "./reddit/tools.js";
import { setupRedditResources } from "./reddit/resources.js";
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
  // Register minimal capabilities
  setupMinimalResource(server);
  setupMinimalTool(server);
  setupMinimalPrompt(server);
  
  // Register Reddit capabilities
  setupRedditTools(server);
  setupRedditResources(server);
  
  return server;
}