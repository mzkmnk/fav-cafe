import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private loader: Loader;
  private isLoaded = false;

  constructor() {
    this.loader = new Loader({
      apiKey: environment.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places']
    });
  }

  async loadMaps(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      await this.loader.load();
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      throw error;
    }
  }

  async getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  }

  async createMap(
    element: HTMLElement,
    options: google.maps.MapOptions
  ): Promise<google.maps.Map> {
    await this.loadMaps();
    return new google.maps.Map(element, options);
  }

  async createMarker(
    position: google.maps.LatLng | google.maps.LatLngLiteral,
    map: google.maps.Map,
    options?: google.maps.MarkerOptions
  ): Promise<google.maps.Marker> {
    await this.loadMaps();
    return new google.maps.Marker({
      position,
      map,
      ...options
    });
  }

  async searchPlaces(
    query: string,
    location?: google.maps.LatLng | google.maps.LatLngLiteral,
    radius?: number
  ): Promise<google.maps.places.PlaceResult[]> {
    await this.loadMaps();
    
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    return new Promise((resolve, reject) => {
      const request: google.maps.places.TextSearchRequest = {
        query,
        location,
        radius: radius || 5000,
        type: 'restaurant'
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      });
    });
  }

  async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult> {
    await this.loadMaps();
    
    const service = new google.maps.places.PlacesService(
      document.createElement('div')
    );

    return new Promise((resolve, reject) => {
      service.getDetails({ placeId }, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place);
        } else {
          reject(new Error(`Place details failed: ${status}`));
        }
      });
    });
  }

  async geocodeAddress(address: string): Promise<google.maps.GeocoderResult[]> {
    await this.loadMaps();
    
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }
} 