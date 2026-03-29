import { NextResponse } from "next/server";
import { getAllPosts, createPost } from "../../../lib/posts-db";

export async function GET() {
  const posts = getAllPosts(true);
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const data = await request.json();
  const post = createPost(data);
  return NextResponse.json(post, { status: 201 });
}
