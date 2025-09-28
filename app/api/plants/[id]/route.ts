import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// 定义路由处理函数的参数类型
interface RouteParams {
  params: {
    id: string;
  };
}

// Get a specific plant
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = params.id;
    
    const plant = await prisma.plant.findUnique({
      where: { id },
      include: {
        checkIns: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ plant });
  } catch (error) {
    console.error('Error fetching plant:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the plant' },
      { status: 500 }
    );
  }
}

// Update a plant (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const id = params.id;

    // Check if user is admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { name, description, imageUrl, waterAmount, waterSchedule, careNotes } = await request.json();

    // 检查必填字段
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Plant name is required' },
        { status: 400 }
      );
    }

    try {
      const plant = await prisma.plant.update({
        where: { id },
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          imageUrl: imageUrl || null,
          waterAmount: waterAmount?.trim() || null,
          waterSchedule: waterSchedule?.trim() || null,
          careNotes: careNotes?.trim() || null,
        }
      });

      return NextResponse.json({ plant });
    } catch (dbError) {
      console.error("Database error updating plant:", dbError);
      return NextResponse.json(
        { error: 'Database operation failed while updating plant' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating plant:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the plant' },
      { status: 500 }
    );
  }
}

// Delete a plant (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const id = params.id;

    // Check if user is admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.plant.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: 'Plant deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting plant:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the plant' },
      { status: 500 }
    );
  }
}