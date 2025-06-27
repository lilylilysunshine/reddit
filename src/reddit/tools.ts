import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RedditClient } from "./client.js";
export function setupRedditTools(server: McpServer): void {
  const reddit = new RedditClient();
  server.registerTool(
    "search_reddit",
    {
      title: "Search Reddit",
      description: "Search for posts across Reddit or within a specific subreddit",
      inputSchema: {
        query: z.string().describe("Search query"),
        subreddit: z.string().optional().describe("Specific subreddit to search in (optional)"),
        sort: z.enum(["relevance", "hot", "top", "new", "comments"]).default("relevance").describe("Sort order for results"),
        limit: z.number().min(1).max(100).default(25).describe("Number of results to return (1-100)")
      }
    },
    async ({ query, subreddit, sort, limit }) => {
      const posts = await reddit.searchPosts(query, subreddit, sort, limit);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            query,
            subreddit: subreddit || "all",
            total_results: posts.length,
            posts: posts.map(post => ({
              title: post.title,
              author: post.author,
              subreddit: post.subreddit,
              score: post.score,
              comments: post.num_comments,
              url: post.permalink,
              created: new Date(post.created_utc * 1000).toISOString()
            }))
          }, null, 2)
        }]
      };
    }
  );
  server.registerTool(
    "get_subreddit_posts",
    {
      title: "Get Subreddit Posts",
      description: "Get posts from a specific subreddit",
      inputSchema: {
        subreddit: z.string().describe("Subreddit name (without r/)"),
        sort: z.enum(["hot", "new", "top", "rising"]).default("hot").describe("Sort order"),
        limit: z.number().min(1).max(100).default(25).describe("Number of posts to retrieve")
      }
    },
    async ({ subreddit, sort, limit }) => {
      const posts = await reddit.getSubredditPosts(subreddit, sort, limit);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            subreddit,
            sort,
            total_posts: posts.length,
            posts: posts.map(post => ({
              title: post.title,
              author: post.author,
              score: post.score,
              comments: post.num_comments,
              url: post.permalink,
              selftext: post.selftext.substring(0, 500) + (post.selftext.length > 500 ? '...' : ''),
              created: new Date(post.created_utc * 1000).toISOString()
            }))
          }, null, 2)
        }]
      };
    }
  );
  server.registerTool(
    "get_post_comments",
    {
      title: "Get Post Comments",
      description: "Get comments from a specific Reddit post",
      inputSchema: {
        subreddit: z.string().describe("Subreddit name"),
        post_id: z.string().describe("Reddit post ID"),
        sort: z.enum(["best", "top", "new", "controversial", "old", "qa"]).default("best").describe("Comment sort order")
      }
    },
    async ({ subreddit, post_id, sort }) => {
      const { post, comments } = await reddit.getPostComments(subreddit, post_id, sort);
      
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            post: {
              title: post.title,
              author: post.author,
              score: post.score,
              text: post.selftext,
              url: post.permalink
            },
            comments: comments.slice(0, 50).map(comment => ({
              author: comment.author,
              body: comment.body.substring(0, 1000) + (comment.body.length > 1000 ? '...' : ''),
              score: comment.score,
              created: new Date(comment.created_utc * 1000).toISOString(),
              reply_count: comment.replies?.length || 0
            }))
          }, null, 2)
        }]
      };
    }
  );
  server.registerTool(
    "analyze_user",
    {
      title: "Analyze Reddit User",
      description: "Get information about a Reddit user's recent posting activity",
      inputSchema: {
        username: z.string().describe("Reddit username (without u/)"),
        limit: z.number().min(1).max(100).default(25).describe("Number of recent posts to analyze")
      }
    },
    async ({ username, limit }) => {
      const posts = await reddit.getUserPosts(username, 'new', limit);
      
      const subreddits = new Map<string, number>();
      let totalScore = 0;
      let totalComments = 0;
      
      posts.forEach(post => {
        subreddits.set(post.subreddit, (subreddits.get(post.subreddit) || 0) + 1);
        totalScore += post.score;
        totalComments += post.num_comments;
      });
      const topSubreddits = Array.from(subreddits.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            username,
            analysis: {
              total_posts_analyzed: posts.length,
              average_score: Math.round(totalScore / posts.length),
              total_karma_from_posts: totalScore,
              average_comments_per_post: Math.round(totalComments / posts.length),
              most_active_subreddits: topSubreddits.map(([name, count]) => ({ subreddit: name, posts: count })),
              recent_posts: posts.slice(0, 10).map(post => ({
                title: post.title,
                subreddit: post.subreddit,
                score: post.score,
                comments: post.num_comments,
                created: new Date(post.created_utc * 1000).toISOString()
              }))
            }
          }, null, 2)
        }]
      };
    }
  );
}