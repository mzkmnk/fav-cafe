import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-cafe-list',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './cafe-list.html',
  styleUrl: './cafe-list.css'
})
export class CafeListComponent {

}
