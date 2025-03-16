"use client";

import { useState } from "react";
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

export default function NewItemPage() {
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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
        // TODO: Show error message to user
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
      
      // Create item
      const response = await fetch("/api/items", {
        method: "POST",
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
        throw new Error("Failed to submit item");
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8 bg-white p-8 rounded-lg shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Report an Item
          </h1>
          <p className="text-muted-foreground">
            Please provide details about the item you found or lost
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

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
                placeholder="Brief description of the item"
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
                placeholder="Detailed description of the item including any identifying features"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <Select name="category" required>
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
                placeholder="Where was it found/lost?"
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

          <div className="flex items-center justify-end">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 