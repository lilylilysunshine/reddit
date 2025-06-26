import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedditClient } from "./client.js";
/**
 * Sets up Reddit resource for subreddit information
 */
export function setupRedditResource(server: McpServer): void {
  const redditClient = new RedditClient();
  server.registerResource(
    "subreddit-info",
    "reddit://r/{subreddit}",
    {
      title: "Subreddit Information", 
      description: "Get information and recent posts from a subreddit",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      const subreddit = uri.pathname.split('/')[2];
      
      if (!subreddit) {
        throw new Error("Subreddit name is required");
      }
      try {
        const posts = await redditClient.getSubredditPosts(subreddit, 'hot', 10);
        
        const subredditInfo = {
          subreddit: subreddit,
          posts_count: posts.length,
          recent_posts: posts.map(post => ({
            title: post.title,
            author: post.author,
            score: post.score,
            comments: post.num_comments,
            url: `https://reddit.com${post.permalink}`
          })),
          timestamp: new Date().toISOString()
        };
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(subredditInfo, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch subreddit info: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  );
}