export interface Cafe {
  id?: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  rating: number;
  category: string[];
  visitedAt: Date;
  photos: Photo[];
  memo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
} 