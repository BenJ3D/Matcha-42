// profile.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  // Mock user data
  user = {
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'johndoe@example.com',
    gender: 'Male',
    sexualPreferences: 'Female',
    bio: 'Just a regular guy who loves coding.',
    interests: ['#coding', '#music', '#travel'],
    fameRating: 75,
    images: [
      'https://via.placeholder.com/600x400?text=Image+1',
      'https://via.placeholder.com/600x400?text=Image+2',
      'https://via.placeholder.com/600x400?text=Image+3',
    ],
  };

  onEditProfile() {
    // Logic to navigate to the edit profile page or open a dialog
    console.log('Edit Profile clicked');
  }
}
