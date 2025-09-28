import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get all plants
export async function GET() {
  try {
    const plants = await prisma.plant.findMany();
    return NextResponse.json({ plants });
  } catch (error) {
    console.error('Error fetching plants:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching plants' },
      { status: 500 }
    );
  }
}

// Create a new plant (admin only)
export async function POST(req: NextRequest) {
  try {
    // 获取会话信息
    const session = await getServerSession(authOptions);
    console.log("Creating plant - Session:", session);
    
    // 检查用户是否已登录
    if (!session) {
      console.log("No session found when creating plant");
      return NextResponse.json(
        { error: 'Unauthorized - No session' },
        { status: 401 }
      );
    }
    
    // 检查用户是否是管理员
    if (session.user.role !== 'ADMIN') {
      console.log("User is not admin:", session.user.role);
      return NextResponse.json(
        { error: 'Unauthorized - Not admin' },
        { status: 403 }
      );
    }

    // 获取请求数据
    const body = await req.json();
    console.log("Plant creation data:", body);
    
    const { name, description, imageUrl, waterAmount, waterSchedule, careNotes } = body;

    // 检查必填字段
    if (!name) {
      return NextResponse.json(
        { error: 'Plant name is required' },
        { status: 400 }
      );
    }

    // 创建植物记录
    const plant = await prisma.plant.create({
      data: {
        name,
        description: description || null,
        imageUrl: imageUrl || null,
        waterAmount: waterAmount || null,
        waterSchedule: waterSchedule || null,
        careNotes: careNotes || null,
      }
    });

    console.log("Plant created successfully:", plant.id);
    return NextResponse.json(
      { plant },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating plant:', error);
    
    // 处理特定错误类型
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A plant with this name already exists' },
        { status: 409 }
      );
    }
    
    // 通用错误处理
    return NextResponse.json(
      { error: 'An error occurred while creating the plant' },
      { status: 500 }
    );
  }
}