import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
/**
 * Sets up the single minimal resource
 */
export function setupMinimalResource(server: McpServer): void {
  server.registerResource(
    "server-info",
    "info://server",
    {
      title: "Server Information",
      description: "Basic information about this Reddit MCP server",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      const serverInfo = {
        name: "reddit-mcp",
        version: "1.0.0",
        description: "A Reddit MCP server with access to Reddit posts, comments, and user data",
        timestamp: new Date().toISOString(),
        features: ["resources", "tools", "prompts", "reddit-integration"],
        uri: uri.href,
        capabilities: {
          resources: 3,
          tools: 5,
          prompts: 1
        },
        transport: "Streamable HTTP",
        status: "active"
      };
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(serverInfo, null, 2),
          mimeType: "application/json"
        }]
      };
    }
  );
}