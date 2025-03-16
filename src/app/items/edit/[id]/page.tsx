"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Image from "next/image";

const categories = [
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "CLOTHING", label: "Clothing" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "DOCUMENTS", label: "Documents" },
  { value: "KEYS", label: "Keys" },
  { value: "BAGS", label: "Bags" },
  { value: "OTHERS", label: "Others" },
];

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date>();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item");
      }
      const data = await response.json();
      setItem(data);
      setDate(new Date(data.date));
      setImageUrls(data.images || []);
    } catch (error) {
      setError("Failed to load item");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadingImages(true);
      const files = Array.from(e.target.files);
      
      try {
        const uploadedUrls = await Promise.all(
          files.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            
            const response = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error("Failed to upload image");
            }
            
            const data = await response.json();
            return data.url;
          })
        );
        
        setImageUrls((prev) => [...prev, ...uploadedUrls]);
      } catch (error) {
        console.error("Error uploading images:", error);
        setError("Failed to upload images");
      } finally {
        setUploadingImages(false);
      }
    }
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      
      const response = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          category: formData.get("category"),
          location: formData.get("location"),
          date: date?.toISOString(),
          images: imageUrls,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <Button
            variant="outline"
            onClick={fetchItem}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Edit Item
          </h1>
          <p className="text-muted-foreground">
            Update the details of your item
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                id="title"
                name="title"
                required
                disabled={loading}
                defaultValue={item?.title}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                required
                disabled={loading}
                defaultValue={item?.description}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select name="category" required defaultValue={item?.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <Input
                id="location"
                name="location"
                required
                disabled={loading}
                defaultValue={item?.location}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Images
              </label>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={loading || uploadingImages}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    disabled={loading || uploadingImages}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {uploadingImages ? "Uploading..." : "Upload Images"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {imageUrls.length} {imageUrls.length === 1 ? "image" : "images"} uploaded
                  </span>
                </div>
                
                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {imageUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={url}
                          alt={`Uploaded image ${index + 1}`}
                          fill
                          className="rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                          onClick={() => {
                            setImageUrls(urls => urls.filter((_, i) => i !== index));
                          }}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 