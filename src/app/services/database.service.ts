import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Cafe } from '../models/cafe.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService extends Dexie {
  cafes!: Table<Cafe>;

  constructor() {
    super('FavCafeDB');
    this.version(1).stores({
      cafes: '++id, name, location.lat, location.lng, rating, visitedAt, createdAt'
    });
  }

  async addCafe(cafe: Omit<Cafe, 'id'>): Promise<string> {
    const id = await this.cafes.add({
      ...cafe,
      id: crypto.randomUUID()
    });
    return id.toString();
  }

  async updateCafe(id: string, cafe: Partial<Cafe>): Promise<void> {
    await this.cafes.update(id, {
      ...cafe,
      updatedAt: new Date()
    });
  }

  async deleteCafe(id: string): Promise<void> {
    await this.cafes.delete(id);
  }

  async getCafe(id: string): Promise<Cafe | undefined> {
    return await this.cafes.get(id);
  }

  async getAllCafes(): Promise<Cafe[]> {
    return await this.cafes.toArray();
  }

  async getCafesByRating(minRating: number): Promise<Cafe[]> {
    return await this.cafes.where('rating').aboveOrEqual(minRating).toArray();
  }

  async searchCafes(query: string): Promise<Cafe[]> {
    return await this.cafes.filter(cafe => 
      cafe.name.toLowerCase().includes(query.toLowerCase()) ||
      cafe.memo.toLowerCase().includes(query.toLowerCase())
    ).toArray();
  }

  async getCafesByCategory(category: string): Promise<Cafe[]> {
    return await this.cafes.filter(cafe => 
      cafe.category.includes(category)
    ).toArray();
  }
} 