import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <h1 class="text-5xl font-bold underline">{{ title }}</h1>
  `
})
export class App {
  protected title = 'frontend';
}
