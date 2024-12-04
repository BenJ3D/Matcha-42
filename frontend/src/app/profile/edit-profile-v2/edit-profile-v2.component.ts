import {MatSelect} from "@angular/material/select";
import {CommonModule} from "@angular/common";
import {MatInputModule} from "@angular/material/input";
import {UserResponseDto} from "../../../DTOs/users/UserResponseDto";
import {MatButtonModule} from "@angular/material/button";
import {ProfileUpdateDto} from "../../../DTOs/profiles/ProfileUpdateDto";
import {Component, Input} from '@angular/core';
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatFormFieldModule} from "@angular/material/form-field";
import {ReactiveFormsModule} from "@angular/forms";
import {CreateProfileComponent} from "../create-profile/create-profile.component";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";

@Component({
  selector: 'app-edit-profile-v2',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatProgressSpinner,
    MatSelect
  ],
  templateUrl: './edit-profile-v2.component.html',
  styleUrl: './edit-profile-v2.component.scss'
})
export class EditProfileV2 extends CreateProfileComponent {
  @Input() backToProfile!: () => void;
  @Input() user!: UserResponseDto | null;

  override ngOnInit() {
    super.ngOnInit();
    if (this.user && this.user?.profile_id) {
      this.profileForm.patchValue({biography: this.user.biography});
      this.profileForm.patchValue({gender: this.user.gender});
      this.profileForm.patchValue({age: this.user.age});
      this.profileForm.patchValue({city: this.user.location?.city_name});


      if (this.user && this.user.sexualPreferences && this.user.sexualPreferences?.length > 0) {
        const sexualPreferenceIds = this.user.sexualPreferences.map(pref => pref.gender_id);
        this.profileForm.patchValue({
          sexualPreferences: sexualPreferenceIds
        });
      }

      if (this.user && this.user.tags && this.user.tags?.length > 0) {
        const tagIds = this.user.tags.map(tag => tag.tag_id);
        this.profileForm.patchValue({
          tags: tagIds
        });
      }
      this.onCityBlur();
    }

  }

  override onSubmit() {
    this.onCityBlur();
    if (this.profileForm.valid) {
      const updateUserData: ProfileUpdateDto = {
        biography: this.profileForm.value.biography,
        gender: this.profileForm.value.gender,
        sexualPreferences: this.profileForm.value.sexualPreferences,
        age: this.profileForm.value.age,
        tags: this.profileForm.value.tags,
        location: this.locationSelected ?? this.locationIp ?? {latitude: 45.783329, longitude: 4.73333},
      }
      this.isLoading = true;
      this.profileService.updateProfile(updateUserData).subscribe({
        next: () => {
          this.toastService.show('User profile updated successfully.');
          this.goToProfile();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating user profile', error);
          this.toastService.show('Error updating user profile');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
          this.backToProfile();
        }
      });
    } else {
      this.profileForm.touched;
    }
  }
}

export class EditProfileV2Component {

}
