import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedditClient } from "./client.js";
export function setupRedditResources(server: McpServer): void {
  const reddit = new RedditClient();
  server.registerResource(
    "subreddit-info",
    "reddit://subreddit/{name}",
    {
      title: "Subreddit Information",
      description: "Get detailed information about a specific subreddit",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      const subredditName = uri.pathname.split('/').pop();
      if (!subredditName) {
        throw new Error("Subreddit name is required");
      }
      const subredditInfo = await reddit.getSubredditInfo(subredditName);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(subredditInfo, null, 2),
          mimeType: "application/json"
        }]
      };
    }
  );
  server.registerResource(
    "subreddit-posts",
    "reddit://r/{subreddit}/posts",
    {
      title: "Subreddit Posts",
      description: "Get recent posts from a subreddit",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      const pathParts = uri.pathname.split('/');
      const subreddit = pathParts[2];
      
      if (!subreddit) {
        throw new Error("Subreddit name is required");
      }
      const searchParams = new URLSearchParams(uri.search);
      const sort = searchParams.get('sort') || 'hot';
      const limit = parseInt(searchParams.get('limit') || '25');
      const posts = await reddit.getSubredditPosts(subreddit, sort, limit);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(posts, null, 2),
          mimeType: "application/json"
        }]
      };
    }
  );
  server.registerResource(
    "user-posts",
    "reddit://user/{username}/posts",
    {
      title: "User Posts",
      description: "Get posts submitted by a specific user",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      const pathParts = uri.pathname.split('/');
      const username = pathParts[2];
      
      if (!username) {
        throw new Error("Username is required");
      }
      const searchParams = new URLSearchParams(uri.search);
      const sort = searchParams.get('sort') || 'new';
      const limit = parseInt(searchParams.get('limit') || '25');
      const posts = await reddit.getUserPosts(username, sort, limit);
      
      return {
        contents: [{
          uri: uri.href,
          text: JSON.stringify(posts, null, 2),
          mimeType: "application/json"
        }]
      };
    }
  );
}