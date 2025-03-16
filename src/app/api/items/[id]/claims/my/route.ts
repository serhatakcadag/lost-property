import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const claim = await prisma.claim.findFirst({
      where: {
        itemId: params.id,
        claimerId: session.user.id,
        deletedAt: null,
      },
    });

    if (!claim) {
      return new NextResponse("No claim found", { status: 404 });
    }

    return NextResponse.json(claim);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 