import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cafe } from '../../models/cafe.model';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-cafe-list',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe, FormsModule],
  templateUrl: './cafe-list.html',
  styleUrl: './cafe-list.css'
})
export class CafeListComponent implements OnInit {
  private dbService = inject(DatabaseService);

  cafes: Cafe[] = [];
  filteredCafes: Cafe[] = [];
  isLoading = true;
  error: string | null = null;
  
  searchQuery = '';
  selectedCategory = '';
  selectedSort = '';

  categories = ['コーヒー', 'お茶', 'デザート', 'パン', 'ランチ', 'ディナー', 'テイクアウト'];

  ngOnInit(): void {
    this.loadCafes();
  }

  private async loadCafes(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      this.cafes = await this.dbService.getAllCafes();
      this.filterAndSortCafes();
    } catch (error) {
      this.error = 'カフェの読み込みに失敗しました';
      console.error('Error loading cafes:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private filterAndSortCafes(): void {
    let filtered = [...this.cafes];

    // 検索フィルター
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(cafe => 
        cafe.name.toLowerCase().includes(query) ||
        cafe.memo.toLowerCase().includes(query) ||
        (cafe.location.address && cafe.location.address.toLowerCase().includes(query))
      );
    }

    // カテゴリフィルター
    if (this.selectedCategory) {
      filtered = filtered.filter(cafe => 
        cafe.category.includes(this.selectedCategory)
      );
    }

    // ソート
    switch (this.selectedSort) {
      case 'rating-desc':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-asc':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.visitedAt).getTime() - new Date(b.visitedAt).getTime());
        break;
      default:
        filtered.sort((a, b) => b.rating - a.rating);
    }

    this.filteredCafes = filtered;
  }

  onSearchChange(): void {
    this.filterAndSortCafes();
  }

  onCategoryChange(): void {
    this.filterAndSortCafes();
  }

  onSortChange(): void {
    this.filterAndSortCafes();
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }

  getTruncatedMemo(memo: string, maxLength: number = 100): string {
    return memo.length > maxLength ? memo.substring(0, maxLength) + '...' : memo;
  }

  refreshList(): void {
    this.loadCafes();
  }
}
