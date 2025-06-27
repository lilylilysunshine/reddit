import { z } from "zod";
// Reddit API response types
export interface RedditPost {
  id: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
}
export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  replies?: RedditComment[];
}
export interface SubredditInfo {
  display_name: string;
  title: string;
  description: string;
  subscribers: number;
  active_user_count: number;
  created_utc: number;
}
export class RedditClient {
  private baseUrl = 'https://www.reddit.com';
  private userAgent = 'MCP-Reddit-Server/1.0.0';
  private async fetchFromReddit(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}.json`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch from Reddit: ${error.message}`);
    }
  }
  async getSubredditPosts(subreddit: string, sort: string = 'hot', limit: number = 25): Promise<RedditPost[]> {
    const endpoint = `/r/${subreddit}/${sort}`;
    const data = await this.fetchFromReddit(`${endpoint}?limit=${limit}`);
    
    return data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      subreddit: child.data.subreddit,
      url: child.data.url,
      selftext: child.data.selftext,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      permalink: child.data.permalink
    }));
  }
  async getPostComments(subreddit: string, postId: string, limit: number = 50): Promise<RedditComment[]> {
    const endpoint = `/r/${subreddit}/comments/${postId}`;
    const data = await this.fetchFromReddit(`${endpoint}?limit=${limit}`);
    
    if (data.length < 2) return [];
    
    return this.parseComments(data[1].data.children);
  }
  private parseComments(children: any[]): RedditComment[] {
    return children
      .filter(child => child.kind === 't1')
      .map(child => ({
        id: child.data.id,
        author: child.data.author,
        body: child.data.body,
        score: child.data.score,
        created_utc: child.data.created_utc,
        replies: child.data.replies?.data?.children ? 
          this.parseComments(child.data.replies.data.children) : undefined
      }));
  }
  async getSubredditInfo(subreddit: string): Promise<SubredditInfo> {
    const endpoint = `/r/${subreddit}/about`;
    const data = await this.fetchFromReddit(endpoint);
    
    return {
      display_name: data.data.display_name,
      title: data.data.title,
      description: data.data.description,
      subscribers: data.data.subscribers,
      active_user_count: data.data.active_user_count,
      created_utc: data.data.created_utc
    };
  }
  async getUserPosts(username: string, sort: string = 'new', limit: number = 25): Promise<RedditPost[]> {
    const endpoint = `/u/${username}/submitted`;
    const data = await this.fetchFromReddit(`${endpoint}?sort=${sort}&limit=${limit}`);
    
    return data.data.children
      .filter((child: any) => child.kind === 't3')
      .map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        author: child.data.author,
        subreddit: child.data.subreddit,
        url: child.data.url,
        selftext: child.data.selftext,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        permalink: child.data.permalink
      }));
  }
}