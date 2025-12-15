import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Toggle like on a post
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // PERMISSION CHECK: Must be authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Must be logged in to like posts' },
        { status: 401 }
      );
    }

    const postId = params.id;
    const userId = session.user.id;

    // Find the post
    const post = await prisma.activityPost.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Parse likedBy array
    const likedBy: string[] = post.likedBy ? JSON.parse(post.likedBy) : [];
    const isLiked = likedBy.includes(userId);

    let updatedLikedBy: string[];
    let newLikes: number;

    if (isLiked) {
      // Unlike: remove userId and decrement
      updatedLikedBy = likedBy.filter(id => id !== userId);
      newLikes = Math.max(0, post.likes - 1);
    } else {
      // Like: add userId and increment
      updatedLikedBy = [...likedBy, userId];
      newLikes = post.likes + 1;
    }

    // Update in database
    const updatedPost = await prisma.activityPost.update({
      where: { id: postId },
      data: {
        likes: newLikes,
        likedBy: JSON.stringify(updatedLikedBy),
      }
    });

    return NextResponse.json({
      post: {
        ...updatedPost,
        likedBy: updatedLikedBy,
        createdAt: updatedPost.createdAt.toISOString(),
      },
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


