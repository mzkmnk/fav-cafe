import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoogleMapsService } from '../../services/google-maps.service';
import { DatabaseService } from '../../services/database.service';
import { Cafe } from '../../models/cafe.model';

@Component({
  selector: 'app-map-view',
  imports: [RouterLink],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapViewComponent implements OnInit, AfterViewInit, OnDestroy {
  private googleMapsService = inject(GoogleMapsService);
  private dbService = inject(DatabaseService);
  
  private map: google.maps.Map | null = null;
  private markers: (google.maps.marker.AdvancedMarkerElement | google.maps.Marker)[] = [];
  private infoWindow: google.maps.InfoWindow | null = null;
  
  // Signals for reactive state management
  cafes = signal<Cafe[]>([]);
  isLoading = signal(false);
  isMinimalMode = signal(true); // ミニマルモード（POI非表示）
  searchQuery = signal('');
  
  // Computed values
  cafeCount = computed(() => this.cafes().length);
  mapStyles = computed(() => this.getMapStyles(this.isMinimalMode()));
  filteredCafes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.cafes();
    
    return this.cafes().filter(cafe =>
      cafe.name.toLowerCase().includes(query) ||
      cafe.memo?.toLowerCase().includes(query) ||
      cafe.location.address?.toLowerCase().includes(query) ||
      cafe.category.some(cat => cat.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    // Google Maps APIの初期化はAfterViewInitで行う
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    this.cleanup();
  }

  private async initializeMap() {
    try {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      // 現在地を取得、失敗時は東京駅をデフォルトとして使用
      const center = await this.getCurrentLocation();

      // Map IDを環境変数から取得、なければDEMOを使用
      const mapId = import.meta.env['NG_APP_GOOGLE_MAPS_MAP_ID'] || 'DEMO_MAP_ID';
      
      // カスタムスタイルを取得（computed値を使用）
      const customMapStyles = this.mapStyles();
      
      const mapOptions: google.maps.MapOptions = {
        center: center,
        zoom: 15, // 現在地なので少しズームイン
        mapId: mapId, // AdvancedMarkerElement用のMap ID
        styles: customMapStyles, // カスタムスタイルを適用
        // すべてのデフォルトUIを無効化
        disableDefaultUI: true,
        clickableIcons: false, // デフォルトアイコンをクリック不可に
        // 必要最小限のコントロールのみ有効
        gestureHandling: 'greedy', // スムーズなジェスチャー操作
      };

      this.map = await this.googleMapsService.createMap(mapElement, mapOptions);
      console.log(`Google Maps initialized successfully with Map ID: ${mapId}`);
      
      // マップ初期化後にカフェデータを読み込んでマーカーを表示
      await this.loadCafesAndCreateMarkers();
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
      
      // Map ID関連のエラーの場合、具体的なメッセージを表示
      if (error instanceof Error && error.message.includes('Map ID')) {
        console.warn('Map ID が無効です。DEMO_MAP_ID を使用していますが、本格運用にはGoogle Cloud ConsoleでMap IDを作成してください。');
      }
    }
  }

  private async getCurrentLocation(): Promise<google.maps.LatLngLiteral> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser. Using default location.');
        resolve({ lat: 35.6812, lng: 139.7671 }); // 東京駅
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('Current location acquired:', currentLocation);
          resolve(currentLocation);
        },
        (error) => {
          console.warn('Error getting current location:', error.message);
          console.log('Using default location (Tokyo Station)');
          resolve({ lat: 35.6812, lng: 139.7671 }); // 東京駅
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // 10秒でタイムアウト
          maximumAge: 300000 // 5分以内のキャッシュ位置を許可
        }
      );
    });
  }

  private async loadCafesAndCreateMarkers(): Promise<void> {
    try {
      this.isLoading.set(true);
      const cafesData = await this.dbService.getAllCafes();
      this.cafes.set(cafesData);
      
      // 既存のマーカーをクリア
      this.clearMarkers();
      
      // InfoWindowを初期化
      if (!this.infoWindow) {
        this.infoWindow = new google.maps.InfoWindow();
      }
      
      // フィルタリングされたカフェのマーカーを作成
      for (const cafe of this.filteredCafes()) {
        await this.createCafeMarker(cafe);
      }
      
      console.log(`${this.cafeCount()} cafes loaded on map`);
    } catch (error) {
      console.error('Failed to load cafes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async createCafeMarker(cafe: Cafe): Promise<void> {
    if (!this.map) return;

    try {
      // マーカーの色をカテゴリに基づいて決定
      const markerColor = this.getMarkerColorByCategory(cafe.category);
      
      // カスタムマーカーのHTMLを作成
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div class="cafe-marker" style="
          background-color: ${markerColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 12px;
        ">
          ☕
        </div>
      `;

      try {
        // AdvancedMarkerElementを試行
        const marker = await this.googleMapsService.createMarker(
          { lat: cafe.location.lat, lng: cafe.location.lng },
          this.map,
          { 
            title: cafe.name,
            content: markerElement
          }
        );

        // マーカークリック時のイベントを追加
        marker.addListener('click', () => {
          this.showCafeInfo(cafe, marker);
        });

        this.markers.push(marker);
      } catch (advancedMarkerError) {
        console.warn('AdvancedMarkerElement failed, falling back to standard Marker:', advancedMarkerError);
        
        // フォールバック: 従来のMarkerを使用（非推奨だが互換性のため）
        const fallbackMarker = new google.maps.Marker({
          position: { lat: cafe.location.lat, lng: cafe.location.lng },
          map: this.map,
          title: cafe.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: markerColor,
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2,
            scale: 8
          }
        });

        // クリックイベントを追加
        fallbackMarker.addListener('click', () => {
          this.showCafeInfoForStandardMarker(cafe, fallbackMarker);
        });

        // 型安全にマーカー配列に追加
        this.markers.push(fallbackMarker);
      }
    } catch (error) {
      console.error('Failed to create marker for cafe:', cafe.name, error);
    }
  }

  private getMarkerColorByCategory(categories: string[]): string {
    const categoryColors: { [key: string]: string } = {
      'コーヒー': '#8B4513',
      'お茶': '#228B22', 
      'デザート': '#FF69B4',
      'パン': '#DAA520',
      'ランチ': '#FF6347',
      'ディナー': '#4169E1',
      'テイクアウト': '#9932CC'
    };

    // 最初のカテゴリの色を使用、なければデフォルト色
    const firstCategory = categories.length > 0 ? categories[0] : '';
    return categoryColors[firstCategory] || '#6366F1';
  }

  private showCafeInfo(cafe: Cafe, marker: google.maps.marker.AdvancedMarkerElement): void {
    if (!this.infoWindow || !this.map) return;

    const content = this.createInfoWindowContent(cafe);
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
  }

  private showCafeInfoForStandardMarker(cafe: Cafe, marker: google.maps.Marker): void {
    if (!this.infoWindow || !this.map) return;

    const content = this.createInfoWindowContent(cafe);
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
  }

  private createInfoWindowContent(cafe: Cafe): HTMLElement {
    const stars = '★'.repeat(Math.floor(cafe.rating)) + '☆'.repeat(5 - Math.floor(cafe.rating));
    
    // セキュアなDOM作成（XSS対策）
    const container = document.createElement('div');
    container.className = 'cafe-info-window';
    container.style.cssText = 'max-width: 250px; padding: 8px;';

    // タイトル
    const title = document.createElement('h3');
    title.style.cssText = 'margin: 0 0 8px 0; font-size: 16px; font-weight: bold;';
    title.textContent = cafe.name;
    container.appendChild(title);

    // 評価
    const ratingDiv = document.createElement('div');
    ratingDiv.style.marginBottom = '4px';
    
    const starsSpan = document.createElement('span');
    starsSpan.style.color = '#fbbf24';
    starsSpan.textContent = stars;
    ratingDiv.appendChild(starsSpan);
    
    const ratingSpan = document.createElement('span');
    ratingSpan.style.cssText = 'margin-left: 4px; color: #6b7280;';
    ratingSpan.textContent = `${cafe.rating}/5`;
    ratingDiv.appendChild(ratingSpan);
    
    container.appendChild(ratingDiv);

    // 住所
    if (cafe.location.address) {
      const addressP = document.createElement('p');
      addressP.style.cssText = 'margin: 4px 0; color: #6b7280; font-size: 14px;';
      addressP.textContent = cafe.location.address;
      container.appendChild(addressP);
    }

    // メモ
    if (cafe.memo) {
      const memoP = document.createElement('p');
      memoP.style.cssText = 'margin: 4px 0; font-size: 14px;';
      memoP.textContent = cafe.memo.length > 100 ? cafe.memo.substring(0, 100) + '...' : cafe.memo;
      container.appendChild(memoP);
    }

    // ボタンコンテナ
    const buttonDiv = document.createElement('div');
    buttonDiv.style.cssText = 'margin-top: 8px; display: flex; gap: 8px;';

    // 詳細ボタン（セキュアなイベントハンドラー）
    const detailButton = document.createElement('button');
    detailButton.style.cssText = `
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    `;
    detailButton.textContent = '詳細';
    detailButton.addEventListener('click', () => {
      window.location.href = `/cafe/${cafe.id}`;
    });
    buttonDiv.appendChild(detailButton);

    // 編集ボタン（セキュアなイベントハンドラー）
    const editButton = document.createElement('button');
    editButton.style.cssText = `
      background-color: #6b7280;
      color: white;
      border: none;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    `;
    editButton.textContent = '編集';
    editButton.addEventListener('click', () => {
      window.location.href = `/cafe/${cafe.id}/edit`;
    });
    buttonDiv.appendChild(editButton);

    container.appendChild(buttonDiv);
    return container;
  }

  private clearMarkers(): void {
    this.markers.forEach(marker => {
      if (marker instanceof google.maps.Marker) {
        // 標準Markerの場合
        marker.setMap(null);
      } else {
        // AdvancedMarkerElementの場合
        marker.map = null;
      }
    });
    this.markers = [];
  }

  private cleanup(): void {
    // マーカーとイベントリスナーのクリーンアップ
    this.clearMarkers();
    
    // InfoWindowのクリーンアップ
    if (this.infoWindow) {
      this.infoWindow.close();
      this.infoWindow = null;
    }
    
    // Mapインスタンスのクリーンアップ
    if (this.map) {
      // マップのイベントリスナーをクリア
      google.maps.event.clearInstanceListeners(this.map);
      this.map = null;
    }
    
    console.log('MapViewComponent cleanup completed');
  }

  // 外部からカフェリストを更新する際に使用
  async refreshCafes(): Promise<void> {
    await this.loadCafesAndCreateMarkers();
  }

  // マップスタイルを切り替え
  toggleMapStyle(): void {
    if (!this.map) return;
    
    this.isMinimalMode.set(!this.isMinimalMode());
    const newStyles = this.mapStyles();
    this.map.setOptions({ styles: newStyles });
    
    console.log(`Map style changed to: ${this.isMinimalMode() ? 'Minimal' : 'Default'}`);
  }

  // 検索機能
  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    // 検索クエリが変更されたらマーカーを再描画
    this.updateMarkersForSearch();
  }

  private async updateMarkersForSearch(): Promise<void> {
    // 既存のマーカーをクリア
    this.clearMarkers();
    
    // フィルタリングされたカフェのマーカーを再作成
    for (const cafe of this.filteredCafes()) {
      await this.createCafeMarker(cafe);
    }
    
    console.log(`${this.filteredCafes().length} filtered cafes displayed`);
  }

  // マップスタイルを生成
  private getMapStyles(isMinimal: boolean): google.maps.MapTypeStyle[] {
    if (!isMinimal) {
      // デフォルトスタイル（Googleのデフォルト表示）
      return [];
    }

    // ミニマルスタイル（カフェマーカーのみを強調） - 2024年最新版
    return [
      {
        // すべてのPOI（Points of Interest）を完全に非表示
        featureType: 'poi',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // ビジネス関連のPOIを非表示
        featureType: 'poi.business',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 観光地を非表示
        featureType: 'poi.attraction',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 政府・公共施設を非表示
        featureType: 'poi.government',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 医療施設を非表示
        featureType: 'poi.medical',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 宗教施設を非表示
        featureType: 'poi.place_of_worship',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 学校を非表示
        featureType: 'poi.school',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // スポーツ施設を非表示
        featureType: 'poi.sports_complex',
        elementType: 'all',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 公園のラベルを非表示
        featureType: 'poi.park',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 風景・地形のラベルを非表示
        featureType: 'landscape',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 自然・地理的特徴のラベルを非表示
        featureType: 'natural',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 交通機関のアイコンを非表示（ラベルは残す）
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 交通機関の駅名は残す（重要な目印）
        featureType: 'transit.station',
        elementType: 'labels.text',
        stylers: [{ visibility: 'on' }]
      },
      {
        // 道路名は残す（ナビゲーション用）
        featureType: 'road',
        elementType: 'labels.text',
        stylers: [{ visibility: 'on' }]
      },
      {
        // 道路アイコンは非表示
        featureType: 'road',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      },
      {
        // 管理区域（市区町村名）は残す
        featureType: 'administrative',
        elementType: 'labels',
        stylers: [{ visibility: 'on' }]
      },
      {
        // 水域のラベルを非表示
        featureType: 'water',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ];
  }
}
