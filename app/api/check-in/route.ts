import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get all check-ins
export async function GET(req: NextRequest) {
  try {
    console.log("API - Fetching check-ins");
    const session = await getServerSession(authOptions);
    
    // 如果没有会话，返回空数组而不是错误
    if (!session) {
      console.log("API - No session, returning empty check-ins array");
      return NextResponse.json({ checkIns: [] });
    }
    
    const checkIns = await prisma.checkIn.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        plant: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`API - Found ${checkIns.length} check-ins`);
    return NextResponse.json({ checkIns });
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching check-ins', checkIns: [] },
      { status: 500 }
    );
  }
}

// Create a new check-in
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { plantId, notes, imageUrl } = await req.json();

    // Check if the user is assigned to care for this plant
    const plantCare = await prisma.plantCare.findFirst({
      where: {
        userId: session.user.id,
        plantId,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } }
        ]
      }
    });

    if (!plantCare && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You are not assigned to care for this plant' },
        { status: 403 }
      );
    }

    const checkIn = await prisma.checkIn.create({
      data: {
        userId: session.user.id,
        plantId,
        notes,
        imageUrl,
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
      { checkIn },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating check-in:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the check-in' },
      { status: 500 }
    );
  }
}