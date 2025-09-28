import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Profile API - Session:", session ? "Authenticated" : "Not authenticated");

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user profile' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Profile Update API - Session:", session);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }

    const { name, email } = await req.json();
    console.log("Updating profile for user:", session.user.id, "New data:", { name, email });

    // Check if email is already taken by another user
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          { error: 'Email is already in use' },
          { status: 400 }
        );
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    console.log("Profile updated successfully:", user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating user profile' },
      { status: 500 }
    );
  }
}

// Change password
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();
    
    // Get the user with their current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'An error occurred while changing password' },
      { status: 500 }
    );
  }
}