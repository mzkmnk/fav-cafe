import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { Cafe } from '../../models/cafe.model';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-cafe-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './cafe-form.html',
  styleUrl: './cafe-form.css'
})
export class CafeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dbService = inject(DatabaseService);

  cafeForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  cafeId: string | null = null;

  predefinedCategories = ['コーヒー', 'お茶', 'デザート', 'パン', 'ランチ', 'ディナー', 'テイクアウト'];

  constructor() {
    this.cafeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      location: this.fb.group({
        lat: [35.6762, [Validators.required]],
        lng: [139.6503, [Validators.required]],
        address: ['']
      }),
      rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      category: this.fb.array([]),
      memo: [''],
      visitedAt: [new Date().toISOString().split('T')[0], [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cafeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.cafeId;
    
    if (this.isEditMode && this.cafeId) {
      this.loadCafe(this.cafeId);
    }
  }

  get categoryFormArray(): FormArray {
    return this.cafeForm.get('category') as FormArray;
  }

  private async loadCafe(id: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      const cafe = await this.dbService.getCafe(id);
      
      if (!cafe) {
        this.error = 'カフェが見つかりません';
        return;
      }

      // フォームに値を設定
      this.cafeForm.patchValue({
        name: cafe.name,
        location: {
          lat: cafe.location.lat,
          lng: cafe.location.lng,
          address: cafe.location.address || ''
        },
        rating: cafe.rating,
        memo: cafe.memo,
        visitedAt: cafe.visitedAt instanceof Date ? 
          cafe.visitedAt.toISOString().split('T')[0] : 
          new Date(cafe.visitedAt).toISOString().split('T')[0]
      });

      // カテゴリを設定
      this.categoryFormArray.clear();
      if (cafe.category) {
        cafe.category.forEach(cat => {
          this.categoryFormArray.push(this.fb.control(cat));
        });
      }
    } catch (error) {
      this.error = 'カフェの読み込みに失敗しました';
      console.error('Error loading cafe:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onCategoryChange(category: string, event: any): void {
    const categoryArray = this.categoryFormArray;
    
    if (event.target.checked) {
      categoryArray.push(this.fb.control(category));
    } else {
      const index = categoryArray.controls.findIndex(control => control.value === category);
      if (index >= 0) {
        categoryArray.removeAt(index);
      }
    }
  }

  isCategorySelected(category: string): boolean {
    return this.categoryFormArray.controls.some(control => control.value === category);
  }

  async onSubmit(): Promise<void> {
    if (this.cafeForm.invalid) {
      this.cafeForm.markAllAsTouched();
      return;
    }

    try {
      this.isLoading = true;
      this.error = null;

      const formValue = this.cafeForm.value;
      const now = new Date();

      const cafeData: Omit<Cafe, 'id'> = {
        name: formValue.name,
        location: {
          lat: Number(formValue.location.lat),
          lng: Number(formValue.location.lng),
          address: formValue.location.address || undefined
        },
        rating: Number(formValue.rating),
        category: formValue.category || [],
        visitedAt: new Date(formValue.visitedAt),
        photos: [],
        memo: formValue.memo || '',
        createdAt: this.isEditMode ? new Date() : now,
        updatedAt: now
      };

      if (this.isEditMode && this.cafeId) {
        await this.dbService.updateCafe(this.cafeId, cafeData);
        this.router.navigate(['/cafe', this.cafeId]);
      } else {
        const id = await this.dbService.addCafe(cafeData);
        this.router.navigate(['/cafe', id]);
      }
    } catch (error) {
      this.error = this.isEditMode ? 'カフェの更新に失敗しました' : 'カフェの保存に失敗しました';
      console.error('Error saving cafe:', error);
    } finally {
      this.isLoading = false;
    }
  }

  cancel(): void {
    if (this.isEditMode && this.cafeId) {
      this.router.navigate(['/cafe', this.cafeId]);
    } else {
      this.router.navigate(['/list']);
    }
  }
}
