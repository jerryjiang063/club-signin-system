import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get all activity posts (newest first)
export async function GET() {
  try {
    const posts = await prisma.activityPost.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Parse likedBy JSON strings to arrays
    const postsWithParsedLikes = posts.map(post => ({
      ...post,
      likedBy: post.likedBy ? JSON.parse(post.likedBy) : [],
      createdAt: post.createdAt.toISOString(),
    }));
    
    return NextResponse.json({ posts: postsWithParsedLikes });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching activity' },
      { status: 500 }
    );
  }
}

// Create a new activity post (authenticated users only)
export async function POST(req: NextRequest) {
  try {
    // PERMISSION CHECK: Must be authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Must be logged in to post' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { text, imageUrl } = body;

    // Validate required fields
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Create new post in database
    const newPost = await prisma.activityPost.create({
      data: {
        text: text.trim(),
        imageUrl: imageUrl || null,
        likes: 0,
        likedBy: "[]",
        userId: session.user.id,
        userName: session.user.name || undefined,
      }
    });

    return NextResponse.json(
      { 
        post: {
          ...newPost,
          likedBy: [],
          createdAt: newPost.createdAt.toISOString(),
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating activity post:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the post' },
      { status: 500 }
    );
  }
}
