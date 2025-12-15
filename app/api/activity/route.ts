import { NextRequest, NextResponse } from 'next/server';
import { readActivity, writeActivity, getLikeIdentifier, ActivityPost } from '@/lib/activity-storage';

// Get all activity posts (newest first)
export async function GET() {
  try {
    const posts = await readActivity();
    // Sort by createdAt descending (newest first)
    const sortedPosts = posts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json({ posts: sortedPosts });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching activity' },
      { status: 500 }
    );
  }
}

// Create a new activity post
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, imageUrl, userId, userName } = body;

    // Validate required fields
    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Read existing posts
    const posts = await readActivity();

    // Create new post
    const newPost: ActivityPost = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      imageUrl: imageUrl || null,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      userId: userId || undefined,
      userName: userName || undefined,
    };

    // Add to beginning of array (will be sorted by GET)
    posts.push(newPost);

    // Write back to file
    await writeActivity(posts);

    return NextResponse.json(
      { post: newPost },
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


