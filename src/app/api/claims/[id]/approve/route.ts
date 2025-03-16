import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

type Context = { params: { id: string } };

export async function POST(
  request: NextRequest,
  context: Context
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the claim
    const claim = await prisma.claim.findUnique({
      where: { id: context.params.id },
      include: { item: true },
    });

    if (!claim) {
      return new NextResponse("Claim not found", { status: 404 });
    }

    // Update claim status
    const updatedClaim = await prisma.claim.update({
      where: { id: context.params.id },
      data: { status: "APPROVED" },
    });

    // Update item status
    await prisma.item.update({
      where: { id: claim.itemId },
      data: { status: "CLAIMED" },
    });

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 