import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

async function approveClaim(claimId: string) {
  'use server';
  
  const session = await getServerSession(authOptions);
  if (!session) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.isAdmin) {
    throw new Error('Unauthorized');
  }

  const claim = await prisma.claim.update({
    where: { id: claimId },
    data: { status: "APPROVED" },
  });

  await prisma.item.update({
    where: { id: claim.itemId },
    data: { status: "CLAIMED" },
  });

  redirect('/admin/claims');
}

export default async function ClaimsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.isAdmin) {
    redirect("/");
  }

  const claims = await prisma.claim.findMany({
    where: {
      status: "PENDING",
      deletedAt: null,
    },
    include: {
      item: true,
      claimer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Claims</h1>
      {claims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Pending Claims</h2>
          <p className="text-gray-500">There are currently no pending claims to review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="border rounded-lg p-6 bg-white shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{claim.item.title}</h2>
                  <p className="text-gray-600">
                    Claimed by: {claim.claimer.name || claim.claimer.email}
                  </p>
                </div>
                <Badge variant="outline">{claim.status}</Badge>
              </div>
              <p className="text-gray-700 mb-4">{claim.description}</p>
              {claim.evidence.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Evidence:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {claim.evidence.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        className="rounded-lg object-cover w-full h-48"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Submitted on {format(claim.createdAt, "PPP")}
                </p>
                <form action={approveClaim.bind(null, claim.id)}>
                  <Button type="submit">Approve Claim</Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 