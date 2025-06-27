import fetch from 'node-fetch';
export interface RedditPost {
  id: string;
  title: string;
  author: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  selftext: string;
  url: string;
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
  public_description: string;
}
export class RedditClient {
  private baseUrl = 'https://www.reddit.com';
  private userAgent: string;
  constructor() {
    this.userAgent = process.env.REDDIT_USER_AGENT || 'RedditMCP/1.0.0';
  }
  private async makeRequest(endpoint: string): Promise<any> {
    const url = `${this.baseUrl}${endpoint}.json`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': this.userAgent
      }
    });
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  }
  async searchPosts(query: string, subreddit?: string, sort: string = 'relevance', limit: number = 25): Promise<RedditPost[]> {
    const subredditPath = subreddit ? `/r/${subreddit}` : '';
    const endpoint = `${subredditPath}/search?q=${encodeURIComponent(query)}&sort=${sort}&limit=${limit}&restrict_sr=${!!subreddit}`;
    
    const data = await this.makeRequest(endpoint);
    return data.data.children.map((child: any) => this.formatPost(child.data));
  }
  async getSubredditPosts(subreddit: string, sort: string = 'hot', limit: number = 25): Promise<RedditPost[]> {
    const endpoint = `/r/${subreddit}/${sort}?limit=${limit}`;
    
    const data = await this.makeRequest(endpoint);
    return data.data.children.map((child: any) => this.formatPost(child.data));
  }
  async getSubredditInfo(subreddit: string): Promise<SubredditInfo> {
    const endpoint = `/r/${subreddit}/about`;
    
    const data = await this.makeRequest(endpoint);
    return this.formatSubredditInfo(data.data);
  }
  async getUserPosts(username: string, sort: string = 'new', limit: number = 25): Promise<RedditPost[]> {
    const endpoint = `/user/${username}/submitted?sort=${sort}&limit=${limit}`;
    
    const data = await this.makeRequest(endpoint);
    return data.data.children.map((child: any) => this.formatPost(child.data));
  }
  async getPostComments(subreddit: string, postId: string, sort: string = 'best'): Promise<{ post: RedditPost; comments: RedditComment[] }> {
    const endpoint = `/r/${subreddit}/comments/${postId}?sort=${sort}`;
    
    const data = await this.makeRequest(endpoint);
    const post = this.formatPost(data[0].data.children[0].data);
    const comments = this.formatComments(data[1].data.children);
    return { post, comments };
  }
  private formatPost(data: any): RedditPost {
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      score: data.score,
      num_comments: data.num_comments,
      created_utc: data.created_utc,
      subreddit: data.subreddit,
      selftext: data.selftext || '',
      url: data.url,
      permalink: `https://reddit.com${data.permalink}`
    };
  }
  private formatSubredditInfo(data: any): SubredditInfo {
    return {
      display_name: data.display_name,
      title: data.title,
      description: data.description,
      subscribers: data.subscribers,
      active_user_count: data.active_user_count || 0,
      created_utc: data.created_utc,
      public_description: data.public_description
    };
  }
  private formatComments(children: any[]): RedditComment[] {
    return children
      .filter(child => child.kind === 't1')
      .map(child => this.formatComment(child.data));
  }
  private formatComment(data: any): RedditComment {
    const comment: RedditComment = {
      id: data.id,
      author: data.author,
      body: data.body,
      score: data.score,
      created_utc: data.created_utc
    };
    if (data.replies && data.replies.data && data.replies.data.children) {
      comment.replies = this.formatComments(data.replies.data.children);
    }
    return comment;
  }
}