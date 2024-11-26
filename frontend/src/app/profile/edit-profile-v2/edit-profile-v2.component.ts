import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {UserResponseDto} from "../../../DTOs/users/UserResponseDto";
import {ProfileService} from "../../../services/profile.service";
import {AuthService} from "../../../services/auth.service";
import {ToastService} from "../../../services/toast.service";
import {UserUpdateDto} from "../../../DTOs/users/UserUpdateDto";
import {CreateProfileComponent} from "../create-profile/create-profile.component";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatSelect} from "@angular/material/select";
import {ProfileCreateDto} from "../../../DTOs/profiles/ProfileCreateDto";
import {ProfileUpdateDto} from "../../../DTOs/profiles/ProfileUpdateDto";

@Component({
  selector: 'app-edit-profile-v2',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
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
    if (this.profileForm.valid) {
      const updateUserData: ProfileUpdateDto = {
        biography: this.profileForm.value.biography,
        gender: this.profileForm.value.gender,
        sexualPreferences: this.profileForm.value.sexualPreferences,
        age: this.profileForm.value.age,
        tags: this.profileForm.value.tags,
        location: this.locationSelected || this.locationIp,
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
