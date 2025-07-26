import { type User, type InsertUser, type Repository, type InsertRepository, type Issue, type InsertIssue, type IssueFilters } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByGithubId(githubId: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;

  // Repository methods
  getRepository(id: string): Promise<Repository | undefined>;
  getRepositoryByGithubId(githubId: number): Promise<Repository | undefined>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  updateRepository(id: string, repository: Partial<InsertRepository>): Promise<Repository | undefined>;

  // Issue methods
  getIssue(id: string): Promise<Issue | undefined>;
  getIssueByGithubId(githubId: number): Promise<Issue | undefined>;
  getIssues(filters: IssueFilters): Promise<{ issues: Issue[]; total: number }>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: string, issue: Partial<InsertIssue>): Promise<Issue | undefined>;
  getRecommendedIssuesForUser(userId: string, filters: IssueFilters): Promise<{ issues: Issue[]; total: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private repositories: Map<string, Repository>;
  private issues: Map<string, Issue>;

  constructor() {
    this.users = new Map();
    this.repositories = new Map();
    this.issues = new Map();
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGithubId(githubId: number): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.githubId === githubId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Repository methods
  async getRepository(id: string): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async getRepositoryByGithubId(githubId: number): Promise<Repository | undefined> {
    return Array.from(this.repositories.values()).find(repo => repo.githubId === githubId);
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = { 
      ...insertRepository, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.repositories.set(id, repository);
    return repository;
  }

  async updateRepository(id: string, updateData: Partial<InsertRepository>): Promise<Repository | undefined> {
    const repository = this.repositories.get(id);
    if (!repository) return undefined;

    const updatedRepository = { ...repository, ...updateData, updatedAt: new Date() };
    this.repositories.set(id, updatedRepository);
    return updatedRepository;
  }

  // Issue methods
  async getIssue(id: string): Promise<Issue | undefined> {
    return this.issues.get(id);
  }

  async getIssueByGithubId(githubId: number): Promise<Issue | undefined> {
    return Array.from(this.issues.values()).find(issue => issue.githubId === githubId);
  }

  async getIssues(filters: IssueFilters): Promise<{ issues: Issue[]; total: number }> {
    let allIssues = Array.from(this.issues.values());

    // Apply filters
    if (filters.languages && filters.languages.length > 0) {
      allIssues = allIssues.filter(issue => 
        issue.language && filters.languages!.includes(issue.language)
      );
    }

    if (filters.difficulty && filters.difficulty.length > 0) {
      allIssues = allIssues.filter(issue => 
        issue.difficulty && filters.difficulty!.includes(issue.difficulty)
      );
    }

    if (filters.repositorySize && filters.repositorySize !== "any") {
      allIssues = allIssues.filter(issue => {
        const stars = issue.repositoryStars || 0;
        switch (filters.repositorySize) {
          case "small": return stars < 100;
          case "medium": return stars >= 100 && stars < 1000;
          case "large": return stars >= 1000;
          default: return true;
        }
      });
    }

    // Sort issues
    const sortBy = filters.sortBy || "recent";
    allIssues.sort((a, b) => {
      switch (sortBy) {
        case "stars":
          return (b.repositoryStars || 0) - (a.repositoryStars || 0);
        case "comments":
          return (b.comments || 0) - (a.comments || 0);
        case "match":
          return (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0);
        case "recent":
        default:
          return new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime();
      }
    });

    const total = allIssues.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const start = (page - 1) * limit;
    const issues = allIssues.slice(start, start + limit);

    return { issues, total };
  }

  async createIssue(insertIssue: InsertIssue): Promise<Issue> {
    const id = randomUUID();
    const issue: Issue = { 
      ...insertIssue, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.issues.set(id, issue);
    return issue;
  }

  async updateIssue(id: string, updateData: Partial<InsertIssue>): Promise<Issue | undefined> {
    const issue = this.issues.get(id);
    if (!issue) return undefined;

    const updatedIssue = { ...issue, ...updateData, updatedAt: new Date() };
    this.issues.set(id, updatedIssue);
    return updatedIssue;
  }

  async getRecommendedIssuesForUser(userId: string, filters: IssueFilters): Promise<{ issues: Issue[]; total: number }> {
    const user = await this.getUser(userId);
    if (!user) return { issues: [], total: 0 };

    let allIssues = Array.from(this.issues.values());

    // Prioritize issues in languages the user knows
    if (user.topLanguages && user.topLanguages.length > 0) {
      allIssues = allIssues.filter(issue => {
        if (!issue.language) return true;
        return user.topLanguages.includes(issue.language);
      });
    }

    // Apply regular filters
    const result = await this.getIssues({ ...filters });
    
    // Mark recommended issues
    const recommendedIssues = result.issues.map(issue => ({
      ...issue,
      isRecommended: user.topLanguages?.includes(issue.language || '') || 
                    issue.labels?.some(label => 
                      ['good first issue', 'beginner friendly', 'help wanted'].includes(label.toLowerCase())
                    ) || false
    }));

    // Sort by recommendation score
    recommendedIssues.sort((a, b) => {
      const scoreA = this.calculateRecommendationScore(a, user);
      const scoreB = this.calculateRecommendationScore(b, user);
      return scoreB - scoreA;
    });

    return { issues: recommendedIssues, total: recommendedIssues.length };
  }

  private calculateRecommendationScore(issue: Issue, user: User): number {
    let score = 0;

    // Language match
    if (issue.language && user.topLanguages?.includes(issue.language)) {
      score += 10;
    }

    // Beginner-friendly labels
    if (issue.labels?.some(label => 
      ['good first issue', 'beginner friendly', 'help wanted'].includes(label.toLowerCase())
    )) {
      score += 15;
    }

    // Repository activity (stars/forks indicate active project)
    if (issue.repositoryStars && issue.repositoryStars > 100) {
      score += 5;
    }

    // Recent activity
    if (issue.updatedAt && new Date(issue.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000) {
      score += 3;
    }

    return score;
  }
}

export const storage = new MemStorage();
