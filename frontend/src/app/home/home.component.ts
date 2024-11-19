import {Component, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatSidenavModule, MatSidenav} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {ProfileService} from '../../services/profile.service';
import {Tag} from '../../models/Tags';
import {UserProfile} from '../../models/Profiles';
import {HttpParams} from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
  ],
})
export class HomeComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly minAge = 18;
  readonly maxAge = 120;
  readonly minFame = 0;
  readonly maxFame = 100;

  currentProfileIndex: number = 0;
  animateRight: boolean = false;
  animateLeft: boolean = false;
  profiles: UserProfile[] = [];
  searchForm!: FormGroup;
  tags: Tag[] = [];
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private profileService: ProfileService,
  ) {
  }

  get currentProfile(): UserProfile | undefined {
    return this.profiles[this.currentProfileIndex];
  }

  ngOnInit() {
    this.initializeSearchForm();
    this.loadTags();
    this.fetchProfiles();
  }

  initializeSearchForm() {
    this.searchForm = this.fb.group({
      ageRange: this.fb.group({
        min: [this.minAge],
        max: [this.maxAge],
      }),
      fameRange: this.fb.group({
        min: [this.minFame],
        max: [this.maxFame],
      }),
      location: [''],
      tags: [[]],
      sortBy: [''],
      order: [''],
    });
  }

  loadTags() {
    this.profileService.getTags().subscribe({
      next: (tags) => {
        this.tags = tags;
      },
      error: (err) => console.error('Error loading tags', err),
    });
  }

  openSearchPanel() {
    this.sidenav.open();
  }

  closeSearchPanel() {
    this.sidenav.close();
  }

  onSearchSubmit() {
    this.closeSearchPanel();
    this.fetchProfiles();
  }

  fetchProfiles() {
    this.isLoading = true;
    let params = new HttpParams();
    const formValue = this.searchForm.getRawValue();

    if (formValue.ageRange.min != null) {
      params = params.set('ageMin', formValue.ageRange.min.toString());
    }
    if (formValue.ageRange.max != null) {
      params = params.set('ageMax', formValue.ageRange.max.toString());
    }
    if (formValue.fameRange.min != null) {
      params = params.set('fameMin', formValue.fameRange.min.toString());
    }
    if (formValue.fameRange.max != null) {
      params = params.set('fameMax', formValue.fameRange.max.toString());
    }
    if (formValue.location) {
      params = params.set('location', formValue.location);
    }
    if (formValue.tags && formValue.tags.length > 0) {
      params = params.set('tags', formValue.tags.join(','));
    }
    if (formValue.sortBy) {
      params = params.set('sortBy', formValue.sortBy);
    }
    if (formValue.order) {
      params = params.set('order', formValue.order);
    }

    this.profileService.searchProfiles(params).subscribe({
      next: (profiles) => {
        this.isLoading = false;
        if (profiles.length === 0) {
          this.profiles = [];
        } else {
          this.profiles = profiles;
          this.currentProfileIndex = 0;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching profiles:', error);
      },
    });
  }

  onSwipe(liked: boolean) {
    const currentProfileId = this.currentProfile?.id;
    if (!currentProfileId) return;

    if (liked) {
      console.log('Liked profile:', this.currentProfile?.username);
      this.animateRight = true;
      // Optional: Call a service method to handle the like action
    } else {
      console.log('Passed profile:', this.currentProfile?.username);
      this.animateLeft = true;
      // Optional: Call a service method to handle the pass action
    }

    setTimeout(() => {
      this.nextProfile();
      this.resetAnimations();
    }, 500);
  }

  nextProfile() {
    if (this.currentProfileIndex < this.profiles.length - 1) {
      this.currentProfileIndex++;
    } else {
      this.profiles = []; // No more profiles
    }
  }

  resetAnimations() {
    this.animateRight = false;
    this.animateLeft = false;
  }

  onLikeClick() {
    this.onSwipe(true);
  }

  onPassClick() {
    this.onSwipe(false);
  }

  goToProfile(userId: number) {
    this.router.navigate(['/profile'], {queryParams: {id: userId}});
  }
}
