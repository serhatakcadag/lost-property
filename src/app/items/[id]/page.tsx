"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { format, formatISO, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Tag,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { ContactReporterModal } from "@/components/items/ContactReporterModal";

type Item = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string;
  date: string;
  createdAt: string;
  images: string[];
  reporterId: string;
  reporter: {
    name: string;
    email: string;
  };
};

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [item, setItem] = useState<Item | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [claimImages, setClaimImages] = useState<File[]>([]);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [existingClaim, setExistingClaim] = useState<any>(null);
  const { toast } = useToast();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  useEffect(() => {
    fetchItem();
    fetchExistingClaim();
  }, [id]);

  useEffect(() => {
    if (item?.date) {
      setDate(parseISO(item.date));
    }
  }, [item?.date]);

  async function fetchItem() {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const data = await response.json();
      setItem(data);
    } catch (error) {
      setError("Failed to load item");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchExistingClaim() {
    try {
      const response = await fetch(`/api/items/${id}/claims/my`);
      if (response.ok) {
        const data = await response.json();
        setExistingClaim(data);
      }
    } catch (error) {
      console.error("Error fetching claim:", error);
    }
  }

  async function handleClaimSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingClaim(true);

    try {
      const formData = new FormData(event.currentTarget);
      const description = formData.get("description");

      // Upload evidence images
      const evidenceUrls = [];
      if (claimImages.length > 0) {
        for (const image of claimImages) {
          const imageFormData = new FormData();
          imageFormData.append("file", image);
          
          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: imageFormData,
          });
          
          if (!uploadRes.ok) {
            throw new Error("Failed to upload evidence images");
          }
          
          const { url } = await uploadRes.json();
          evidenceUrls.push(url);
        }
      }

      // Submit claim
      const response = await fetch(`/api/items/${id}/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          evidence: evidenceUrls,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit claim");
      }

      const claim = await response.json();
      setExistingClaim(claim);
      toast({
        title: "Claim submitted",
        description: "Your claim has been submitted and is pending review.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to submit claim. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingClaim(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FOUND":
        return "bg-green-100 text-green-800";
      case "RETURNED":
        return "bg-blue-100 text-blue-800";
      case "CLAIMED":
        return "bg-purple-100 text-purple-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  const nextImage = () => {
    if (item?.images && currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Helper function for consistent date formatting
  const formatDate = (date: string | Date) => {
    if (typeof date === 'string') {
      return format(parseISO(date), "PPP");
    }
    return format(date, "PPP");
  };

  const renderContactButton = () => {
    if (!session?.user) {
      return (
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Authentication Required",
              description: "Please sign in to see contact information.",
              variant: "destructive",
            });
          }}
        >
          Sign in to Contact
        </Button>
      );
    }

    if (session.user.id === item.reporterId) {
      return null; // Don't show contact button for own items
    }

    if (!item.reporter.email) {
      return (
        <Button variant="outline" disabled>
          No contact information available
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        onClick={() => {
          window.location.href = `mailto:${item.reporter.email}`;
        }}
      >
        Contact Reporter via Email
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error || "Item not found"}</p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const renderClaimSection = () => {
    if (!session) {
      return (
        <Button 
          className="mt-6 w-full" 
          onClick={() => router.push('/login')}
        >
          Sign in to Claim This Item
        </Button>
      );
    }

    if (item?.reporterId === session?.user?.id) {
      return null; // Don't show claim button for the reporter
    }

    if (existingClaim) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Claim</CardTitle>
            <div className="mt-1">
              <Badge variant="outline">{existingClaim.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{existingClaim.description}</p>
            {existingClaim.evidence.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {existingClaim.evidence.map((url: string, index: number) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={url}
                      alt={`Evidence ${index + 1}`}
                      fill
                      className="rounded-md object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-6 w-full">Claim This Item</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleClaimSubmit}>
            <DialogHeader>
              <DialogTitle>Claim Item</DialogTitle>
              <DialogDescription>
                Please provide proof of ownership for this item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Proof of Ownership
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe how you can prove this item belongs to you..."
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Evidence Images
                </label>
                <div className="flex items-center gap-4">
                  <Input
                    id="evidence"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        setClaimImages(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("evidence")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Evidence
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {claimImages.length} {claimImages.length === 1 ? "file" : "files"} selected
                  </span>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submittingClaim}>
                {submittingClaim ? "Submitting..." : "Submit Claim"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            {item.images && item.images.length > 0 ? (
              <>
                <Image
                  src={item.images[currentImageIndex]}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                {item.images.length > 1 && (
                  <div className="absolute inset-0 flex items-center justify-between p-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={previousImage}
                      disabled={currentImageIndex === 0}
                      className="rounded-full bg-white/80 hover:bg-white"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextImage}
                      disabled={currentImageIndex === item.images.length - 1}
                      className="rounded-full bg-white/80 hover:bg-white"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <p className="text-muted-foreground">No images available</p>
              </div>
            )}
          </div>

          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {item.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative aspect-square overflow-hidden rounded-md ${
                    index === currentImageIndex
                      ? "ring-2 ring-primary ring-offset-2"
                      : ""
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${item.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Item Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Tag className="mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="ml-2">{item.category}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2">{item.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2">
                    {item?.date ? formatDate(item.date) : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">Reported:</span>
                  <span className="ml-2">
                    {item.createdAt ? formatDate(item.createdAt) : "Not specified"}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4" />
                  <span className="text-muted-foreground">Reported by:</span>
                  <span className="ml-2">{item.reporter.name}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>

              <div className="flex flex-col gap-4">
                {renderContactButton()}
                <Button variant="outline" className="w-full">
                  Report Issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {renderClaimSection()}

      <ContactReporterModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        reporterId={item.reporterId}
        itemId={item.id}
        reporterName={item.reporter.name || "Anonymous"}
      />
    </div>
  );
} 