import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
export function setupRedditPrompts(server: McpServer): void {
  server.registerPrompt(
    "analyze_reddit_post",
    {
      title: "Analyze Reddit Post",
      description: "Generate analysis prompts for Reddit posts and discussions",
      argsSchema: {
        analysis_type: z.enum(["sentiment", "engagement", "topic", "controversy", "summary"]).describe("Type of analysis to perform"),
        context: z.string().optional().describe("Additional context for the analysis")
      }
    },
    ({ analysis_type, context = "" }) => {
      const prompts: Record<string, string> = {
        sentiment: `Analyze the sentiment of this Reddit post and its comments. Look for emotional tone, community reaction, and overall mood. Consider both the original post content and the comment responses. ${context}`,
        engagement: `Analyze the engagement patterns of this Reddit post. Examine the score, comment count, response quality, and community interaction patterns. Identify what makes this post engaging or not. ${context}`,
        topic: `Analyze the main topics and themes discussed in this Reddit post and its comments. Identify key subjects, related discussions, and emerging themes in the conversation. ${context}`,
        controversy: `Analyze potential controversial aspects of this Reddit post. Look for divisive opinions, conflicting viewpoints, and heated discussions in the comments. Assess the level of controversy and its sources. ${context}`,
        summary: `Provide a comprehensive summary of this Reddit post and its key discussions. Include the main points, top comments, and overall community response. ${context}`
      };
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: prompts[analysis_type]
          }
        }]
      };
    }
  );
  server.registerPrompt(
    "reddit_content_creation",
    {
      title: "Reddit Content Creation",
      description: "Generate prompts for creating Reddit content",
      argsSchema: {
        content_type: z.enum(["post_title", "comment_reply", "discussion_starter", "ama_questions"]).describe("Type of content to create"),
        subreddit: z.string().optional().describe("Target subreddit"),
        topic: z.string().optional().describe("Specific topic or theme")
      }
    },
    ({ content_type, subreddit = "", topic = "" }) => {
      const prompts: Record<string, string> = {
        post_title: `Create an engaging Reddit post title ${subreddit ? `for r/${subreddit}` : ""} ${topic ? `about ${topic}` : ""}. Make it attention-grabbing but not clickbait, following Reddit best practices for titles.`,
        comment_reply: `Write a thoughtful Reddit comment reply ${topic ? `regarding ${topic}` : ""}. Make it constructive, informative, and engaging while following Reddit etiquette.`,
        discussion_starter: `Create a discussion-starting Reddit post ${subreddit ? `for r/${subreddit}` : ""} ${topic ? `about ${topic}` : ""}. Include thought-provoking questions that encourage community engagement.`,
        ama_questions: `Generate interesting and respectful questions for a Reddit AMA (Ask Me Anything) ${topic ? `with someone involved in ${topic}` : ""}. Make them engaging and likely to get good responses.`
      };
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: prompts[content_type]
          }
        }]
      };
    }
  );
  server.registerPrompt(
    "subreddit_research",
    {
      title: "Subreddit Research",
      description: "Generate prompts for researching and understanding subreddit communities",
      argsSchema: {
        research_type: z.enum(["community_culture", "posting_guidelines", "trending_topics", "user_behavior"]).describe("Type of research to conduct"),
        subreddit: z.string().optional().describe("Specific subreddit to research")
      }
    },
    ({ research_type, subreddit = "" }) => {
      const prompts: Record<string, string> = {
        community_culture: `Analyze the community culture and dynamics of ${subreddit ? `r/${subreddit}` : "this subreddit"}. Look at communication styles, shared values, common interests, and unwritten rules that guide community behavior.`,
        posting_guidelines: `Research and summarize the posting guidelines and rules for ${subreddit ? `r/${subreddit}` : "this subreddit"}. Include both formal rules and informal community expectations for successful posting.`,
        trending_topics: `Identify trending topics and popular discussion themes in ${subreddit ? `r/${subreddit}` : "this subreddit"}. Look for recurring subjects, hot button issues, and emerging trends in the community.`,
        user_behavior: `Analyze user behavior patterns in ${subreddit ? `r/${subreddit}` : "this subreddit"}. Examine posting frequency, engagement levels, comment quality, and how users interact with each other.`
      };
      return {
        messages: [{
          role: "user",
          content: {
            type: "text",
            text: prompts[research_type]
          }
        }]
      };
    }
  );
}