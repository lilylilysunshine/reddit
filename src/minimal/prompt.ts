import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Sets up the single minimal prompt
 */
export function setupMinimalPrompt(server: McpServer): void {
  server.registerPrompt(
    "greeting",
    {
      title: "Personal Greeting",
      description: "Generate a personalized greeting message for a given name",
      argsSchema: {
        name: z.string().optional().describe("The name of the person to greet"),
        style: z.enum(["formal", "casual", "friendly"]).optional().describe("The greeting style (optional)")
      }
    },
    ({ name = "User", style = "friendly" }) => {
      const greetingPrompts: Record<string, string> = {
        formal: `Please create a formal, professional greeting for ${name}. Make it respectful and appropriate for business settings.`,
        casual: `Please create a casual, relaxed greeting for ${name}. Make it informal and conversational.`,
        friendly: `Please create a warm, personalized greeting for ${name}. Make it friendly and welcoming.`
      };

      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: greetingPrompts[style] || greetingPrompts.friendly
          }
        }]
      };
    }
  );
}

/**
 * Sets up the QR code generation prompt
 */
export function setupMinimalPrompt(server: McpServer): void {
  server.registerPrompt(
    "qr_suggestion",
    {
      title: "QR Code Content Suggestion",
      description: "Generate suggestions for QR code content based on use case",
      argsSchema: {
        useCase: z.enum(["business", "personal", "event", "contact", "wifi"]).describe("The intended use case for the QR code"),
        context: z.string().optional().describe("Additional context or details")
      }
    },
    ({ useCase, context = "" }) => {
      const suggestions: Record<string, string> = {
        business: `Generate QR code content for a business use case. ${context} Consider including: company website URL, contact information, or product links. Make it professional and easy to scan.`,
        personal: `Generate QR code content for personal use. ${context} Consider including: personal website, social media profiles, or contact details. Keep it simple and relevant.`,
        event: `Generate QR code content for an event. ${context} Consider including: event registration link, location details, or schedule information. Make it informative and actionable.`,
        contact: `Generate QR code content for sharing contact information. ${context} Consider vCard format or simple contact details. Include name, phone, email, and relevant social links.`,
        wifi: `Generate QR code content for WiFi sharing. ${context} Use the format: WIFI:T:WPA;S:NetworkName;P:Password;; Make it easy for guests to connect.`
      };
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: suggestions[useCase] || suggestions.business
          }
        }]
      };
    }
  );
}
