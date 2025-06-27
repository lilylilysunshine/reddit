import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { RedditClient } from "./client.js";
export function setupRedditResources(server: McpServer): void {
  const reddit = new RedditClient();
  // Resource: Popular subreddits
  server.registerResource(
    "popular-subreddits",
    "reddit://popular",
    {
      title: "Popular Subreddits",
      description: "List of popular Reddit communities",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      try {
        const popularSubreddits = [
          'AskReddit', 'funny', 'worldnews', 'todayilearned', 'pics',
          'gaming', 'movies', 'music', 'science', 'technology',
          'programming', 'dataisbeautiful', 'MachineLearning', 'artificial'
        ];
        const subredditData = await Promise.allSettled(
          popularSubreddits.map(async (sub) => {
            const info = await reddit.getSubredditInfo(sub);
            return {
              name: info.display_name,
              title: info.title,
              subscribers: info.subscribers,
              description: info.description.substring(0, 200) + '...'
            };
          })
        );
        const successful = subredditData
          .filter(result => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<any>).value);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({
              popular_subreddits: successful,
              total_count: successful.length,
              last_updated: new Date().toISOString()
            }, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch popular subreddits: ${error.message}`);
      }
    }
  );
  // Resource: Trending posts from r/all
  server.registerResource(
    "trending-posts",
    "reddit://trending",
    {
      title: "Trending Posts",
      description: "Hot posts from r/all",
      mimeType: "application/json"
    },
    async (uri: URL) => {
      try {
        const posts = await reddit.getSubredditPosts('all', 'hot', 20);
        
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({
              trending_posts: posts.map(post => ({
                title: post.title,
                author: post.author,
                subreddit: post.subreddit,
                score: post.score,
                comments: post.num_comments,
                permalink: `https://reddit.com${post.permalink}`,
                created: new Date(post.created_utc * 1000).toISOString()
              })),
              total_count: posts.length,
              last_updated: new Date().toISOString()
            }, null, 2),
            mimeType: "application/json"
          }]
        };
      } catch (error) {
        throw new Error(`Failed to fetch trending posts: ${error.message}`);
      }
    }
  );
}