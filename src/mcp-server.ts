import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { setupMinimalResource } from "./minimal/resource.js";
import { setupMinimalTool } from "./minimal/tool.js";
import { setupMinimalPrompt } from "./minimal/prompt.js";

/**
 * Creates and configures the QR code MCP server instance
 */
export function createMCPServer(): McpServer {
  const serverName = process.env.MCP_SERVER_NAME || "qr-mcp";
  const serverVersion = process.env.MCP_SERVER_VERSION || "1.0.0";
  
  console.log(`🔧 Creating MCP server: ${serverName} v${serverVersion}`);
  
  // Create the MCP server instance
  const server = new McpServer({
    name: serverName,
    version: serverVersion
  });

  console.log("📦 Registering minimal MCP capabilities...");
  
  // Register the single resource
  setupMinimalResource(server);
  console.log("✅ Resource registered: server-info");
  
  // Register the QR code generation tool
  setupMinimalTool(server);
  console.log("✅ Tool registered: echo");
  
  // Register the QR code suggestion prompt
  setupMinimalPrompt(server);
  console.log("✅ Prompt registered: greeting");
  
  console.log("🎉 Minimal MCP server configuration completed");
  
  return server;
}
