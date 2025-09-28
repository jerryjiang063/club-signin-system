import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get specific site content by key
export async function GET(
  req: NextRequest,
  context: { params: { key: string } }
) {
  try {
    const key = context.params.key;
    console.log(`Fetching site content with key: ${key}`);
    
    const content = await prisma.siteContent.findUnique({
      where: { key }
    });

    if (!content) {
      console.log(`Content with key '${key}' not found`);
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching site content' },
      { status: 500 }
    );
  }
}

// Update specific site content (admin only)
export async function PUT(
  req: NextRequest,
  context: { params: { key: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const key = context.params.key;
    
    console.log(`Updating site content with key: ${key}`);
    console.log("Session:", session ? "Authenticated" : "Not authenticated");

    // Check if user is admin
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Not admin' },
        { status: 403 }
      );
    }

    const { title, content, imageUrl } = await req.json();
    console.log("Update data:", { title, content: content?.substring(0, 50) + "...", imageUrl });

    // Check if the content exists
    const existingContent = await prisma.siteContent.findUnique({
      where: { key }
    });

    // If content doesn't exist, create it
    if (!existingContent) {
      console.log(`Content with key '${key}' not found, creating new entry`);
      const newContent = await prisma.siteContent.create({
        data: {
          key,
          title,
          content,
          imageUrl
        }
      });
      return NextResponse.json({ content: newContent });
    }

    // Update the content
    const updatedContent = await prisma.siteContent.update({
      where: { key },
      data: {
        title,
        content,
        imageUrl
      }
    });

    console.log(`Content with key '${key}' updated successfully`);
    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    console.error('Error updating site content:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating site content' },
      { status: 500 }
    );
  }
}