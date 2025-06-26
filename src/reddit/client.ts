import fetch from 'node-fetch';
export interface RedditPost {
  id: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  url: string;
  selftext: string;
  subreddit: string;
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
export class RedditClient {
  private baseUrl = 'https://www.reddit.com';
  private userAgent: string;
  constructor() {
    this.userAgent = process.env.REDDIT_USER_AGENT || 'reddit-mcp-server/1.0.0';
  }
  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'User-Agent': this.userAgent
      }
    });
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
  async getSubredditPosts(subreddit: string, sort: string = 'hot', limit: number = 25): Promise<RedditPost[]> {
    const endpoint = `/r/${subreddit}/${sort}.json?limit=${limit}`;
    const data = await this.makeRequest(endpoint);
    
    return data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      url: child.data.url,
      selftext: child.data.selftext,
      subreddit: child.data.subreddit,
      permalink: child.data.permalink
    }));
  }
  async getPostComments(subreddit: string, postId: string, limit: number = 100): Promise<RedditComment[]> {
    const endpoint = `/r/${subreddit}/comments/${postId}.json?limit=${limit}`;
    const data = await this.makeRequest(endpoint);
    
    if (!data[1] || !data[1].data || !data[1].data.children) {
      return [];
    }
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
        replies: child.data.replies?.data?.children 
          ? this.parseComments(child.data.replies.data.children)
          : []
      }));
  }
  async getUserPosts(username: string, sort: string = 'new', limit: number = 25): Promise<RedditPost[]> {
    const endpoint = `/user/${username}/submitted.json?sort=${sort}&limit=${limit}`;
    const data = await this.makeRequest(endpoint);
    
    return data.data.children
      .filter((child: any) => child.kind === 't3')
      .map((child: any) => ({
        id: child.data.id,
        title: child.data.title,
        author: child.data.author,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        url: child.data.url,
        selftext: child.data.selftext,
        subreddit: child.data.subreddit,
        permalink: child.data.permalink
      }));
  }
  async searchPosts(query: string, subreddit?: string, sort: string = 'relevance', limit: number = 25): Promise<RedditPost[]> {
    const searchEndpoint = subreddit 
      ? `/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=${sort}&limit=${limit}`
      : `/search.json?q=${encodeURIComponent(query)}&sort=${sort}&limit=${limit}`;
    
    const data = await this.makeRequest(searchEndpoint);
    
    return data.data.children.map((child: any) => ({
      id: child.data.id,
      title: child.data.title,
      author: child.data.author,
      score: child.data.score,
      num_comments: child.data.num_comments,
      created_utc: child.data.created_utc,
      url: child.data.url,
      selftext: child.data.selftext,
      subreddit: child.data.subreddit,
      permalink: child.data.permalink
    }));
  }
}