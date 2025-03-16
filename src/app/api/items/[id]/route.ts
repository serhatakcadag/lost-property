import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const item = await prisma.item.findUnique({
      where: { id: context.params.id },
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Check if user owns the item
    if (item.reporterId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Soft delete
    await prisma.item.update({
      where: { id: context.params.id },
      data: { deletedAt: new Date() },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const item = await prisma.item.findUnique({
      where: { id: context.params.id },
      include: {
        reporter: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const { title, description, category, location, date, images } = json;

    const item = await prisma.item.findUnique({
      where: { id: context.params.id },
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Check if user owns the item
    if (item.reporterId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedItem = await prisma.item.update({
      where: { id: context.params.id },
      data: {
        title,
        description,
        category,
        location,
        date: new Date(date),
        images,
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 