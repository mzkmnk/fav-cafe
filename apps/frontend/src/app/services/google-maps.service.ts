import { Injectable } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsService {
  private loader: Loader;
  private isLoaded = false;

  constructor() {
    this.loader = new Loader({
      apiKey: import.meta.env['NG_APP_GOOGLE_MAPS_API_KEY'],
      version: 'weekly',
      libraries: ['places', 'marker']
    });
  }

  async loadMaps(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      await this.loader.importLibrary('maps');
      await this.loader.importLibrary('places');
      await this.loader.importLibrary('marker');
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
    position: google.maps.LatLngLiteral,
    map: google.maps.Map,
    options?: { title?: string; content?: Element }
  ): Promise<google.maps.marker.AdvancedMarkerElement> {
    await this.loadMaps();
    
    return new google.maps.marker.AdvancedMarkerElement({
      position,
      map,
      title: options?.title,
      content: options?.content
    });
  }

  async searchPlaces(
    query: string,
    location?: google.maps.LatLngLiteral,
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

      service.textSearch(request, (results: google.maps.places.PlaceResult[] | null, status: google.maps.places.PlacesServiceStatus) => {
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
      const request: google.maps.places.PlaceDetailsRequest = { placeId };
      
      service.getDetails(request, (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
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
      const request: google.maps.GeocoderRequest = { address };
      
      geocoder.geocode(request, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }
} 