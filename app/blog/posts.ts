export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: string;
  keywords: string[];
  readingTime: number;
  sections: {
    heading: string;
    content: string;
  }[];
};

// Delegate to SQLite database
import {
  getAllPosts as dbGetAllPosts,
  getPostBySlug as dbGetPostBySlug,
  getAllSlugs as dbGetAllSlugs,
} from "../../lib/posts-db";

export const posts: BlogPost[] = dbGetAllPosts();

export function getPost(slug: string): BlogPost | undefined {
  return dbGetPostBySlug(slug);
}

export function getAllSlugs(): string[] {
  return dbGetAllSlugs();
}
