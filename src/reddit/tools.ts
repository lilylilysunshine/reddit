import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedditClient } from "./client.js";
/**
 * Sets up Reddit tools for fetching posts, comments, and user data
 */
export function setupRedditTools(server: McpServer): void {
  const redditClient = new RedditClient();
  // Tool: Get subreddit posts
  server.registerTool(
    "get_subreddit_posts",
    {
      title: "Get Subreddit Posts",
      description: "Fetch posts from a specific subreddit",
      inputSchema: {
        subreddit: z.string().describe("Name of the subreddit (without r/)"),
        sort: z.enum(['hot', 'new', 'top', 'rising']).optional().describe("Sort order for posts"),
        limit: z.number().min(1).max(100).optional().describe("Number of posts to fetch (1-100)")
      }
    },
    async ({ subreddit, sort = 'hot', limit = 25 }) => {
      try {
        const posts = await redditClient.getSubredditPosts(subreddit, sort, limit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              subreddit,
              sort,
              count: posts.length,
              posts: posts.map(post => ({
                id: post.id,
                title: post.title,
                author: post.author,
                score: post.score,
                comments: post.num_comments,
                created: new Date(post.created_utc * 1000).toISOString(),
                url: `https://reddit.com${post.permalink}`,
                preview: post.selftext?.substring(0, 200) + (post.selftext?.length > 200 ? '...' : '')
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        subreddit: z.string().describe("Name of the subreddit"),
        post_id: z.string().describe("Reddit post ID"),
        limit: z.number().min(1).max(500).optional().describe("Number of comments to fetch (1-500)")
      }
    },
    async ({ subreddit, post_id, limit = 100 }) => {
      try {
        const comments = await redditClient.getPostComments(subreddit, post_id, limit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              post_id,
              subreddit,
              comments_count: comments.length,
              comments: comments.map(comment => ({
                id: comment.id,
                author: comment.author,
                score: comment.score,
                created: new Date(comment.created_utc * 1000).toISOString(),
                body: comment.body?.substring(0, 500) + (comment.body?.length > 500 ? '...' : ''),
                replies_count: comment.replies?.length || 0
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
  // Tool: Get user posts
  server.registerTool(
    "get_user_posts",
    {
      title: "Get User Posts",
      description: "Fetch posts submitted by a specific Reddit user",
      inputSchema: {
        username: z.string().describe("Reddit username (without u/)"),
        sort: z.enum(['new', 'hot', 'top']).optional().describe("Sort order for posts"),
        limit: z.number().min(1).max(100).optional().describe("Number of posts to fetch (1-100)")
      }
    },
    async ({ username, sort = 'new', limit = 25 }) => {
      try {
        const posts = await redditClient.getUserPosts(username, sort, limit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              username,
              sort,
              count: posts.length,
              posts: posts.map(post => ({
                id: post.id,
                title: post.title,
                subreddit: post.subreddit,
                score: post.score,
                comments: post.num_comments,
                created: new Date(post.created_utc * 1000).toISOString(),
                url: `https://reddit.com${post.permalink}`
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch user posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
  // Tool: Search posts
  server.registerTool(
    "search_posts",
    {
      title: "Search Reddit Posts",
      description: "Search for posts across Reddit or within a specific subreddit",
      inputSchema: {
        query: z.string().describe("Search query"),
        subreddit: z.string().optional().describe("Limit search to specific subreddit (optional)"),
        sort: z.enum(['relevance', 'hot', 'top', 'new', 'comments']).optional().describe("Sort order for results"),
        limit: z.number().min(1).max(100).optional().describe("Number of results to fetch (1-100)")
      }
    },
    async ({ query, subreddit, sort = 'relevance', limit = 25 }) => {
      try {
        const posts = await redditClient.searchPosts(query, subreddit, sort, limit);
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              query,
              subreddit: subreddit || 'all',
              sort,
              count: posts.length,
              posts: posts.map(post => ({
                id: post.id,
                title: post.title,
                author: post.author,
                subreddit: post.subreddit,
                score: post.score,
                comments: post.num_comments,
                created: new Date(post.created_utc * 1000).toISOString(),
                url: `https://reddit.com${post.permalink}`,
                preview: post.selftext?.substring(0, 200) + (post.selftext?.length > 200 ? '...' : '')
              }))
            }, null, 2)
          }]
        };
      } catch (error) {
        throw new Error(`Failed to search posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}