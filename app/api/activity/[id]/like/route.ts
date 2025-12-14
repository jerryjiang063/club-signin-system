import { NextRequest, NextResponse } from 'next/server';
import { readActivity, writeActivity, getLikeIdentifier } from '@/lib/activity-storage';

// Toggle like on a post
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const identifier = getLikeIdentifier(req);

    // Read existing posts
    const posts = await readActivity();
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = posts[postIndex];
    const isLiked = post.likedBy.includes(identifier);

    if (isLiked) {
      // Unlike: remove identifier and decrement
      post.likedBy = post.likedBy.filter(id => id !== identifier);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like: add identifier and increment
      post.likedBy.push(identifier);
      post.likes = post.likes + 1;
    }

    // Write back to file
    await writeActivity(posts);

    return NextResponse.json({
      post,
      liked: !isLiked,
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { error: 'An error occurred while toggling like' },
      { status: 500 }
    );
  }
}

