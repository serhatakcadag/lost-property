import { prisma } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { SearchFilters } from "@/components/items/SearchFilters";
import Link from "next/link";

export default async function LostItemsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; status?: string }>;
}) {
  const { search, category, status } = await searchParams;

  const items = await prisma.item.findMany({
    where: {
      deletedAt: null,
      title: search ? { contains: search, mode: "insensitive" } : undefined,
      category: category ? (category as any) : undefined,
      status: status ? (status as any) : undefined,
    },
    include: {
      reporter: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Lost Items</h1>
        <Link href="/items/new">
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90">
            Report Lost Item
          </button>
        </Link>
      </div>

      <SearchFilters />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="block border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>
              <Badge variant="outline">{item.status}</Badge>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
            {item.images.length > 0 && (
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Posted by {item.reporter.name || "Anonymous"}</span>
              <span>{format(item.createdAt, "PP")}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 