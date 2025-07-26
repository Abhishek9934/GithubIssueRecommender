import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  githubId: integer("github_id").notNull().unique(),
  username: text("username").notNull().unique(),
  avatarUrl: text("avatar_url"),
  name: text("name"),
  bio: text("bio"),
  publicRepos: integer("public_repos").default(0),
  followers: integer("followers").default(0),
  following: integer("following").default(0),
  topLanguages: jsonb("top_languages").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  githubId: integer("github_id").notNull().unique(),
  name: text("name").notNull(),
  fullName: text("full_name").notNull(),
  owner: text("owner").notNull(),
  description: text("description"),
  language: text("language"),
  stars: integer("stars").default(0),
  forks: integer("forks").default(0),
  openIssues: integer("open_issues").default(0),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  githubId: integer("github_id").notNull().unique(),
  number: integer("number").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  state: text("state").notNull(),
  labels: jsonb("labels").$type<string[]>().default([]),
  language: text("language"),
  repositoryName: text("repository_name").notNull(),
  repositoryOwner: text("repository_owner").notNull(),
  repositoryStars: integer("repository_stars").default(0),
  repositoryForks: integer("repository_forks").default(0),
  comments: integer("comments").default(0),
  difficulty: text("difficulty"), // beginner, intermediate, advanced
  isRecommended: boolean("is_recommended").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertRepositorySchema = createInsertSchema(repositories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIssueSchema = createInsertSchema(issues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRepository = z.infer<typeof insertRepositorySchema>;
export type Repository = typeof repositories.$inferSelect;

export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issues.$inferSelect;

// Filter schemas
export const issueFiltersSchema = z.object({
  languages: z.array(z.string()).optional(),
  difficulty: z.array(z.string()).optional(),
  repositorySize: z.enum(["any", "small", "medium", "large"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["recent", "stars", "match", "comments"]).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

export type IssueFilters = z.infer<typeof issueFiltersSchema>;
