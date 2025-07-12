import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoogleMapsService } from '../../services/google-maps.service';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css'
})
export class MapViewComponent implements OnInit, AfterViewInit {
  private googleMapsService = inject(GoogleMapsService);
  private map: google.maps.Map | null = null;

  ngOnInit() {
    // Google Maps APIの初期化はAfterViewInitで行う
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private async initializeMap() {
    try {
      const mapElement = document.getElementById('map');
      if (!mapElement) {
        console.error('Map element not found');
        return;
      }

      // 東京駅を中心とした初期位置
      const center = { lat: 35.6812, lng: 139.7671 };

      const mapOptions = {
        center: center,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      };

      this.map = await this.googleMapsService.createMap(mapElement, mapOptions);
      console.log('Google Maps initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Maps:', error);
    }
  }
}
