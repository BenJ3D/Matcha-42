import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-toast',
  standalone: true,
  imports: [],
  templateUrl: './custom-toast.component.html',
  styleUrl: './custom-toast.component.scss'
})
export class CustomToastComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}