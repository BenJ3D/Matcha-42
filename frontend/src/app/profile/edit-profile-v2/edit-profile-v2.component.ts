import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {UserResponseDto} from "../../../DTOs/users/UserResponseDto";
import {CreateProfileComponent} from "../create-profile/create-profile.component";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatSelect} from "@angular/material/select";
import {ProfileUpdateDto} from "../../../DTOs/profiles/ProfileUpdateDto";

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

//   override ngOnInit() {
// //TODO: Implement ngOnInit avec chargement des donnée de l'utilisateur
//   }

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
        error: (err) => {
          console.error('Error updating user profile', err);
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
