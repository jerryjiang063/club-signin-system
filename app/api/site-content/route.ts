import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get all site content
export async function GET() {
  try {
    console.log("Fetching all site content");
    
    // 检查数据库中是否有内容
    const contentCount = await prisma.siteContent.count();
    console.log(`Found ${contentCount} content items in database`);
    
    // 如果没有内容，初始化一些默认内容
    if (contentCount === 0) {
      console.log("No content found, initializing default content");
      
      const defaultContents = [
        {
          key: 'home_hero',
          title: 'Growing Together,Blooming Knowledge',
          content: 'Welcome to our In-Class Gardening Club platform. Track plant care, share your gardening journey, and learn together in our green community.',
          imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2342&q=80',
        },
        {
          key: 'features_title',
          title: 'How Our Club Works',
          content: 'A simple and effective way to manage plant care in our community',
          imageUrl: null,
        },
        {
          key: 'benefits_title',
          title: 'Benefits of Our Platform',
          content: 'Why our gardening club platform makes plant care easier and more enjoyable',
          imageUrl: null,
        },
        {
          key: 'cta_section',
          title: 'Ready to Join Our Gardening Community?',
          content: 'Sign up today and start your plant care journey with our in-class gardening club.',
          imageUrl: null,
        },
        {
          key: 'about_hero',
          title: 'About Our In-Class Gardening Club',
          content: 'Welcome to the heart of our green community! The In-Class Gardening Club is dedicated to fostering a love for nature, teaching valuable plant care skills, and building a vibrant, collaborative environment among students.',
          imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083293ca604?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
        },
        {
          key: 'about_content',
          title: 'Our Mission and Values',
          content: 'We believe that by nurturing plants, we also nurture responsibility, patience, and a deeper connection to the natural world. Our club aims to provide hands-on experience with various plant species, teach sustainable gardening practices, and create a collaborative environment where knowledge can be shared freely.',
          imageUrl: null,
        },
        {
          key: 'contact_info',
          title: 'Get in Touch',
          content: 'Email: info@gardeningclub.com\nPhone: +1 (234) 567-890\nAddress: 123 Green Street, Classroom 4B, School City, SC 12345',
          imageUrl: null,
        },
        {
          key: 'privacy_content',
          title: 'Privacy Policy',
          content: 'Your privacy is important to us. This policy explains how we collect, use, and protect your personal information within the In-Class Gardening Club platform.',
          imageUrl: null,
        }
      ];
      
      // 批量创建内容
      for (const item of defaultContents) {
        await prisma.siteContent.create({
          data: item
        });
      }
      
      console.log("Default content initialized");
    }
    
    const content = await prisma.siteContent.findMany();
    console.log(`Returning ${content.length} content items`);
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching site content:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching site content' },
      { status: 500 }
    );
  }
}

// Update site content (admin only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Updating site content - Session:", session);

    // Check if user is admin
    if (!session) {
      console.log("No session found when updating site content");
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'ADMIN') {
      console.log("User is not admin:", session.user.role);
      return NextResponse.json(
        { error: 'Unauthorized - Not admin' },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("Content update data:", body);
    
    const { key, title, content, imageUrl } = body;

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