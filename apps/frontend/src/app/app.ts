import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Navigation -->
      <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-bold text-gray-900">Fav Cafe</h1>
            </div>
            <div class="flex items-center space-x-4">
              <a 
                routerLink="/map" 
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors"
              >
                地図
              </a>
              <a 
                routerLink="/list" 
                routerLinkActive="text-blue-600 border-b-2 border-blue-600"
                class="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-transparent transition-colors"
              >
                リスト
              </a>
              <a 
                routerLink="/add-cafe" 
                class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + カフェ追加
              </a>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class App {
  title = 'Fav Cafe';
}
