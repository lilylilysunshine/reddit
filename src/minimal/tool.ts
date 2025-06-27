import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
/**
 * Sets up the single minimal tool
 */
export function setupMinimalTool(server: McpServer): void {
  server.registerTool(
    "echo",
    {
      title: "Echo Tool",
      description: "Echoes back the provided message with timestamp and server metadata",
      inputSchema: {
        message: z.string().describe("The message to echo back")
      }
    },
    async ({ message }) => {
      const response = {
        input: {
          original: message,
          length: message.length,
          type: typeof message
        },
        output: {
          echoed: `Echo: ${message}`,
          timestamp: new Date().toISOString(),
          server: "reddit-mcp",
          processed: true
        },
        metadata: {
          tool: "echo",
          version: "1.0.0",
          transport: "Streamable HTTP"
        }
      };
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2)
        }]
      };
    }
  );
}