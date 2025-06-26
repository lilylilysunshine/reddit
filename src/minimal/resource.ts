import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Sets up the single minimal resource
 */
export function setupMinimalResource(server: McpServer): void {
  server.registerResource(
    "server-info",
    "info://server",
    {
      title: "QR Code Server Information",
      description: "Information about this QR code generation MCP server",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      const serverInfo = {
        name: "qr-mcp",
        version: "1.0.0",
        description: "A minimal MCP server for QR code generation",
        timestamp: new Date().toISOString(),
        features: ["qr-code-generation", "resources", "tools", "prompts"],
        uri: uri.href,
        capabilities: {
          resources: 1,
          tools: 1,
          prompts: 1
        },
        transport: "Streamable HTTP",
        status: "active",
        qrCodeOptions: {
          supportedErrorLevels: ["L", "M", "Q", "H"],
          defaultSize: 300,
          outputFormat: "PNG (base64 data URL)"
        }
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
