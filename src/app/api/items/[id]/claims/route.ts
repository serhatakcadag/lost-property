import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await request.json();
    const { description, evidence } = json;

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: context.params.id },
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Check if user already has a pending claim
    const existingClaim = await prisma.claim.findFirst({
      where: {
        itemId: context.params.id,
        claimerId: session.user.id,
        deletedAt: null,
      },
    });

    if (existingClaim) {
      return new NextResponse("You already have a claim for this item", { status: 400 });
    }

    // Create new claim
    const claim = await prisma.claim.create({
      data: {
        itemId: context.params.id,
        claimerId: session.user.id,
        description,
        evidence,
      },
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 