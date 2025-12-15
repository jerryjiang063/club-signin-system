import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Delete a post (admin or author only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // PERMISSION CHECK #1: Must be authenticated
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Must be logged in' },
        { status: 401 }
      );
    }

    const postId = params.id;
    
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

    // PERMISSION CHECK #2: Must be admin OR author
    const isAdmin = session.user.role === 'ADMIN';
    const isAuthor = post.userId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own posts' },
        { status: 403 }
      );
    }

    // Delete from database
    await prisma.activityPost.delete({
      where: { id: postId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the post' },
      { status: 500 }
    );
  }
}

