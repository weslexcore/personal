import type { Metadata } from "next";
import { PhotoGallery } from "@/components/photos/PhotoGallery";
import { getPhotos } from "@/lib/photos";

export const metadata: Metadata = { title: "Photography" };

export default function PhotosPage() {
  return <PhotoGallery photos={getPhotos()} />;
}
