import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { content, recipientId, itemId } = body;

    if (!content || !recipientId || !itemId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: session.user.id,
        recipientId,
        itemId,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 