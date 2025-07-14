import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { Cafe } from '../../models/cafe.model';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-cafe-detail',
  standalone: true,
  imports: [RouterLink, NgIf, NgFor, DatePipe],
  templateUrl: './cafe-detail.html',
  styleUrl: './cafe-detail.css'
})
export class CafeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dbService = inject(DatabaseService);
  
  cafe: Cafe | null = null;
  isLoading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCafe(id);
    } else {
      this.router.navigate(['/list']);
    }
  }

  private async loadCafe(id: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      const cafe = await this.dbService.getCafe(id);
      this.cafe = cafe || null;
      if (!this.cafe) {
        this.error = 'カフェが見つかりません';
      }
    } catch (error) {
      this.error = 'カフェの読み込みに失敗しました';
      console.error('Error loading cafe:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async deleteCafe(): Promise<void> {
    if (!this.cafe || !confirm('このカフェを削除しますか？')) {
      return;
    }

    try {
      await this.dbService.deleteCafe(this.cafe.id!);
      this.router.navigate(['/list']);
    } catch (error) {
      alert('カフェの削除に失敗しました');
      console.error('Error deleting cafe:', error);
    }
  }

  getRatingStars(rating: number): string {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  }
}
