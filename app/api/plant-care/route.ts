import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get all plant care assignments
export async function GET(req: NextRequest) {
  try {
    // 使用 getServerSession 获取会话
    const session = await getServerSession(authOptions);
    
    console.log("API - Session:", session ? "Authenticated" : "Not authenticated");
    
    // 如果没有会话，返回空数组而不是错误
    if (!session) {
      console.log("API - No session, returning empty array");
      return NextResponse.json({ plantCare: [] });
    }
    
    console.log("API - User role:", session.user.role);
    console.log("API - User ID:", session.user.id);

    // 如果是管理员，获取所有分配
    if (session.user.role === 'ADMIN') {
      console.log("API - Admin user, fetching all assignments");
      const plantCare = await prisma.plantCare.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          plant: true,
        }
      });
      return NextResponse.json({ plantCare });
    }

    // 如果是普通会员，只获取他们的分配
    console.log("API - Regular user, fetching their assignments");
    const plantCare = await prisma.plantCare.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        plant: true,
      }
    });

    return NextResponse.json({ plantCare });
  } catch (error) {
    console.error('Error fetching plant care assignments:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching plant care assignments', plantCare: [] },
      { status: 500 }
    );
  }
}

// Create a new plant care assignment (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId, plantId, startDate, endDate } = await req.json();

    const plantCare = await prisma.plantCare.create({
      data: {
        userId,
        plantId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        plant: true,
      }
    });

    return NextResponse.json(
      { plantCare },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating plant care assignment:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the plant care assignment' },
      { status: 500 }
    );
  }
}