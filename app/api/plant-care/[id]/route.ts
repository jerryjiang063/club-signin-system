import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get a specific plant care assignment
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const plantCare = await prisma.plantCare.findUnique({
      where: { id: params.id },
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

    if (!plantCare) {
      return NextResponse.json(
        { error: 'Plant care assignment not found' },
        { status: 404 }
      );
    }

    // If not admin, check if the assignment belongs to the user
    if (session.user.role !== 'ADMIN' && plantCare.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ plantCare });
  } catch (error) {
    console.error('Error fetching plant care assignment:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the plant care assignment' },
      { status: 500 }
    );
  }
}

// Update a plant care assignment (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { userId, plantId, startDate, endDate, taskType, notes } = await req.json();

    const plantCare = await prisma.plantCare.update({
      where: { id: params.id },
      data: {
        userId,
        plantId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        taskType,
        notes,
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

    return NextResponse.json({ plantCare });
  } catch (error) {
    console.error('Error updating plant care assignment:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the plant care assignment' },
      { status: 500 }
    );
  }
}

// Delete a plant care assignment (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.plantCare.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Plant care assignment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting plant care assignment:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the plant care assignment' },
      { status: 500 }
    );
  }
}
