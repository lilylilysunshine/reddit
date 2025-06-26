import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import QRCode from "qrcode";

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
          server: "minimal-mcp",
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

/**
 * Sets up the QR code generation tool
 */
export function setupMinimalTool(server: McpServer): void {
  server.registerTool(
    "generate_qr",
    {
      title: "QR Code Generator",
      description: "Generate QR codes from text input with customizable options",
      inputSchema: {
        text: z.string().describe("The text or URL to encode in the QR code"),
        size: z.number().optional().describe("QR code size in pixels (default: 300)"),
        errorLevel: z.enum(["L", "M", "Q", "H"]).optional().describe("Error correction level (default: M)")
      }
    },
    async ({ text, size = 300, errorLevel = "M" }) => {
      try {
        const qrDataURL = await QRCode.toDataURL(text, {
          width: size,
          errorCorrectionLevel: errorLevel,
          margin: 2
        });
        const response = {
          input: {
            text,
            size,
            errorLevel,
            textLength: text.length
          },
          output: {
            qrCodeDataURL: qrDataURL,
            format: "data:image/png;base64",
            timestamp: new Date().toISOString(),
            server: "qr-mcp"
          },
          metadata: {
            tool: "generate_qr",
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
      } catch (error) {
        throw new Error(`QR code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}
