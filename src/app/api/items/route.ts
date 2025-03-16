import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Define the valid categories based on your schema
type ItemCategory = 'ELECTRONICS' | 'CLOTHING' | 'ACCESSORIES' | 'DOCUMENTS' | 'KEYS' | 'BAGS' | 'OTHERS';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const { title, description, category, location, date, images } = json;

    if (!title || !description || !category || !location || !date) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Validate category
    const validCategories: ItemCategory[] = [
      'ELECTRONICS',
      'CLOTHING',
      'ACCESSORIES',
      'DOCUMENTS',
      'KEYS',
      'BAGS',
      'OTHERS'
    ];

    if (!validCategories.includes(category as ItemCategory)) {
      return new NextResponse("Invalid category", { status: 400 });
    }

    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        location,
        date: new Date(date),
        status: "PENDING",
        images: images || [],
        reporterId: session.user.id,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const items = await prisma.item.findMany({
      where: {
        OR: [
          { reporterId: session.user.id },
          { finderId: session.user.id }
        ],
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 