import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertIssueSchema, insertRepositorySchema, issueFiltersSchema } from "@shared/schema";
import { z } from "zod";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  private: boolean;
  created_at: string;
  updated_at: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  labels: Array<{ name: string }>;
  comments: number;
  created_at: string;
  updated_at: string;
  repository_url: string;
}

async function fetchFromGitHub(endpoint: string): Promise<any> {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitHub-Issue-Recommender'
  };
  
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(`${GITHUB_API_BASE}${endpoint}`, { headers });
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

function determineDifficulty(labels: string[]): string {
  const labelText = labels.join(' ').toLowerCase();
  
  if (labelText.includes('good first issue') || labelText.includes('beginner')) {
    return 'beginner';
  }
  if (labelText.includes('intermediate') || labelText.includes('medium')) {
    return 'intermediate';
  }
  if (labelText.includes('advanced') || labelText.includes('hard') || labelText.includes('expert')) {
    return 'advanced';
  }
  
  return 'beginner'; // Default for unlabeled issues
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get or create user by GitHub username
  app.post("/api/users/github/:username", async (req, res) => {
    try {
      const { username } = req.params;
      
      // Check if user exists in storage
      const existingUser = await storage.getUserByGithubId(0); // We'll use username lookup
      
      // Fetch from GitHub API
      const githubUser: GitHubUser = await fetchFromGitHub(`/users/${username}`);
      const githubRepos: GitHubRepo[] = await fetchFromGitHub(`/users/${username}/repos?sort=updated&per_page=10`);
      
      // Extract top languages
      const languageCounts: Record<string, number> = {};
      githubRepos.forEach(repo => {
        if (repo.language) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
        }
      });
      
      const topLanguages = Object.entries(languageCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([lang]) => lang);

      const userData = {
        githubId: githubUser.id,
        username: githubUser.login,
        avatarUrl: githubUser.avatar_url,
        name: githubUser.name,
        bio: githubUser.bio,
        publicRepos: githubUser.public_repos,
        followers: githubUser.followers,
        following: githubUser.following,
        topLanguages,
      };

      // Check if user exists by GitHub ID
      const existingUserByGithubId = await storage.getUserByGithubId(githubUser.id);
      
      let user;
      if (existingUserByGithubId) {
        user = await storage.updateUser(existingUserByGithubId.id, userData);
      } else {
        user = await storage.createUser(userData);
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to fetch GitHub user data' 
      });
    }
  });

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Sync GitHub issues for recommendations
  app.post("/api/sync-issues", async (req, res) => {
    try {
      // Search for beginner-friendly issues across popular repositories
      const searchQueries = [
        'label:"good first issue" state:open',
        'label:"beginner friendly" state:open',
        'label:"help wanted" state:open language:javascript',
        'label:"help wanted" state:open language:python',
        'label:"help wanted" state:open language:typescript',
        'label:"good first issue" state:open language:go',
      ];

      let allIssues: any[] = [];

      for (const query of searchQueries) {
        try {
          const searchResult = await fetchFromGitHub(`/search/issues?q=${encodeURIComponent(query)}&sort=updated&per_page=20`);
          allIssues = allIssues.concat(searchResult.items || []);
        } catch (error) {
          console.warn(`Failed to fetch issues for query: ${query}`, error);
        }
      }

      // Remove duplicates and process issues
      const uniqueIssues = allIssues.filter((issue, index, self) => 
        index === self.findIndex(i => i.id === issue.id)
      );

      const processedIssues = [];

      for (const githubIssue of uniqueIssues) {
        try {
          // Extract repository info from URL
          const repoInfo = githubIssue.repository_url.split('/').slice(-2);
          const [owner, repoName] = repoInfo;

          // Fetch repository details
          let repoDetails;
          try {
            repoDetails = await fetchFromGitHub(`/repos/${owner}/${repoName}`);
          } catch (error) {
            console.warn(`Failed to fetch repo details for ${owner}/${repoName}`);
            continue;
          }

          const labels = githubIssue.labels?.map((label: any) => label.name) || [];
          
          const issueData = {
            githubId: githubIssue.id,
            number: githubIssue.number,
            title: githubIssue.title,
            body: githubIssue.body || '',
            state: githubIssue.state,
            labels,
            language: repoDetails.language,
            repositoryName: repoName,
            repositoryOwner: owner,
            repositoryStars: repoDetails.stargazers_count,
            repositoryForks: repoDetails.forks_count,
            comments: githubIssue.comments,
            difficulty: determineDifficulty(labels),
            isRecommended: labels.some((label: string) => 
              ['good first issue', 'beginner friendly', 'help wanted'].includes(label.toLowerCase())
            ),
          };

          // Check if issue exists
          const existingIssue = await storage.getIssueByGithubId(githubIssue.id);
          
          if (existingIssue) {
            await storage.updateIssue(existingIssue.id, issueData);
          } else {
            await storage.createIssue(issueData);
          }
          
          processedIssues.push(issueData);
        } catch (error) {
          console.warn(`Failed to process issue ${githubIssue.id}:`, error);
        }
      }

      res.json({ 
        message: `Successfully synced ${processedIssues.length} issues`,
        count: processedIssues.length 
      });
    } catch (error) {
      console.error('Error syncing issues:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Failed to sync issues' 
      });
    }
  });

  // Get recommended issues for a user
  app.get("/api/users/:userId/recommended-issues", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Transform query parameters for proper parsing
      const query = { ...req.query };
      
      // Handle array parameters that come as strings
      if (query.languages && typeof query.languages === 'string') {
        query.languages = [query.languages];
      }
      if (query.difficulty && typeof query.difficulty === 'string') {
        query.difficulty = [query.difficulty];
      }
      
      // Handle numeric parameters - parse but don't assign back to query
      const page = query.page && typeof query.page === 'string' ? parseInt(query.page, 10) : undefined;
      const limit = query.limit && typeof query.limit === 'string' ? parseInt(query.limit, 10) : undefined;
      
      // Handle search parameter
      const search = query.search && typeof query.search === 'string' ? query.search.trim() : undefined;
      
      // Create properly typed filters object
      const filters = issueFiltersSchema.parse({
        ...query,
        page,
        limit,
        search
      });
      
      const result = await storage.getRecommendedIssuesForUser(userId, filters);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch recommended issues" });
    }
  });

  // Get all issues with filters
  app.get("/api/issues", async (req, res) => {
    try {
      // Transform query parameters for proper parsing
      const query = { ...req.query };
      
      // Handle array parameters that come as strings
      if (query.languages && typeof query.languages === 'string') {
        query.languages = [query.languages];
      }
      if (query.difficulty && typeof query.difficulty === 'string') {
        query.difficulty = [query.difficulty];
      }
      
      // Handle numeric parameters - parse but don't assign back to query
      const page = query.page && typeof query.page === 'string' ? parseInt(query.page, 10) : undefined;
      const limit = query.limit && typeof query.limit === 'string' ? parseInt(query.limit, 10) : undefined;
      
      // Handle search parameter
      const search = query.search && typeof query.search === 'string' ? query.search.trim() : undefined;
      
      // Create properly typed filters object
      const filters = issueFiltersSchema.parse({
        ...query,
        page,
        limit,
        search
      });
      
      const result = await storage.getIssues(filters);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch issues" });
    }
  });

  // Get available languages and stats
  app.get("/api/stats", async (req, res) => {
    try {
      const allIssues = await storage.getIssues({});
      
      const languageCounts: Record<string, number> = {};
      const difficultyCounts: Record<string, number> = {};
      
      allIssues.issues.forEach(issue => {
        if (issue.language) {
          languageCounts[issue.language] = (languageCounts[issue.language] || 0) + 1;
        }
        if (issue.difficulty) {
          difficultyCounts[issue.difficulty] = (difficultyCounts[issue.difficulty] || 0) + 1;
        }
      });

      const topLanguages = Object.entries(languageCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([lang, count]) => ({ name: lang, count }));

      res.json({
        totalIssues: allIssues.total,
        recommendedIssues: allIssues.issues.filter(i => i.isRecommended).length,
        newIssues: allIssues.issues.filter(i => 
          i.updatedAt && new Date(i.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
        topLanguages,
        difficultyCounts,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
