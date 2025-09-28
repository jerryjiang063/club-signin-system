import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get all users
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Admin Users API - Session:", session ? "Authenticated" : "Not authenticated");
    if (session) {
      console.log("User role:", session.user.role);
    }

    // Check if user is admin
    if (!session) {
      console.log("No session found when fetching users");
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${users.length} users`);
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}

// Create a new user (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Creating user - Session:", session);

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

    const body = await req.json();
    console.log("User creation data:", body);
    
    const { name, email, password, role } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'MEMBER',
      }
    });

    // Don't return the password
    const { password: _, ...userWithoutPassword } = user;
    
    console.log("User created successfully:", userWithoutPassword.id);
    return NextResponse.json(
      { user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the user' },
      { status: 500 }
    );
  }
}