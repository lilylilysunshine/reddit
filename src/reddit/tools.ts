import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedditClient } from "./client.js";
export function setupRedditTools(server: McpServer): void {
  const reddit = new RedditClient();
  // Tool: Get subreddit posts
  server.registerTool(
    "get_subreddit_posts",
    {
      title: "Get Subreddit Posts",
      description: "Fetch posts from a specific subreddit",
      inputSchema: {
        subreddit: z.string().describe("The subreddit name (without r/)"),
        sort: z.enum(["hot", "new", "top", "rising"]).optional().describe("Sort method"),
        limit: z.number().min(1).max(100).optional().describe("Number of posts to fetch (max 100)")
      }
    },
    async ({ subreddit, sort = "hot", limit = 25 }) => {
      try {
        const posts = await reddit.getSubredditPosts(subreddit, sort, limit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              subreddit,
              sort,
              count: posts.length,
              posts: posts.map(post => ({
                title: post.title,
                author: post.author,
                score: post.score,
                comments: post.num_comments,
                url: post.url,
                permalink: `https://reddit.com${post.permalink}`,
                created: new Date(post.created_utc * 1000).toISOString(),
                preview: post.selftext ? post.selftext.substring(0, 200) + '...' : null
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch subreddit posts: ${error.message}`);
      }
    }
  );
  // Tool: Get post comments
  server.registerTool(
    "get_post_comments",
    {
      title: "Get Post Comments",
      description: "Fetch comments from a specific Reddit post",
      inputSchema: {
        subreddit: z.string().describe("The subreddit name"),
        post_id: z.string().describe("The post ID"),
        limit: z.number().min(1).max(100).optional().describe("Number of comments to fetch")
      }
    },
    async ({ subreddit, post_id, limit = 50 }) => {
      try {
        const comments = await reddit.getPostComments(subreddit, post_id, limit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              subreddit,
              post_id,
              comment_count: comments.length,
              comments: comments.map(comment => ({
                author: comment.author,
                body: comment.body,
                score: comment.score,
                created: new Date(comment.created_utc * 1000).toISOString(),
                has_replies: !!comment.replies && comment.replies.length > 0
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch post comments: ${error.message}`);
      }
    }
  );
  // Tool: Get subreddit info
  server.registerTool(
    "get_subreddit_info",
    {
      title: "Get Subreddit Information",
      description: "Get detailed information about a subreddit",
      inputSchema: {
        subreddit: z.string().describe("The subreddit name")
      }
    },
    async ({ subreddit }) => {
      try {
        const info = await reddit.getSubredditInfo(subreddit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              name: info.display_name,
              title: info.title,
              description: info.description,
              subscribers: info.subscribers,
              active_users: info.active_user_count,
              created: new Date(info.created_utc * 1000).toISOString(),
              url: `https://reddit.com/r/${info.display_name}`
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch subreddit info: ${error.message}`);
      }
    }
  );
  // Tool: Get user posts
  server.registerTool(
    "get_user_posts",
    {
      title: "Get User Posts",
      description: "Fetch posts submitted by a specific user",
      inputSchema: {
        username: z.string().describe("The Reddit username"),
        sort: z.enum(["new", "hot", "top"]).optional().describe("Sort method"),
        limit: z.number().min(1).max(100).optional().describe("Number of posts to fetch")
      }
    },
    async ({ username, sort = "new", limit = 25 }) => {
      try {
        const posts = await reddit.getUserPosts(username, sort, limit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              username,
              sort,
              post_count: posts.length,
              posts: posts.map(post => ({
                title: post.title,
                subreddit: post.subreddit,
                score: post.score,
                comments: post.num_comments,
                url: post.url,
                permalink: `https://reddit.com${post.permalink}`,
                created: new Date(post.created_utc * 1000).toISOString()
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch user posts: ${error.message}`);
      }
    }
  );
}