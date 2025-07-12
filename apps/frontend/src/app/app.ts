import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <h1 class="text-3xl font-bold underline">{{ title }}</h1>
    <router-outlet></router-outlet>
  `
})
export class App {
  protected title = 'frontend';
}
