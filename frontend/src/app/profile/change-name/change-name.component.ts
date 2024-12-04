import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { UserResponseDto } from "../../../DTOs/users/UserResponseDto";
import { ProfileService } from "../../../services/profile.service";
import { AuthService } from "../../../services/auth.service";
import { ToastService } from "../../../services/toast.service";
import { UserUpdateDto } from "../../../DTOs/users/UserUpdateDto";

@Component({
  selector: 'app-change-name',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './change-name.component.html',
  styleUrl: './change-name.component.scss'
})
export class ChangeNameComponent implements OnInit {
  @Input() backToProfile!: () => void;
  @Input() user!: UserResponseDto | null;

  namesForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.namesForm = this.fb.group({
      first_name: [
        this.user?.first_name ?? '',
        [
          Validators.required,
          Validators.maxLength(255),
        ]
      ],
      last_name: [
        this.user?.last_name ?? '',
        [
          Validators.required,
          Validators.maxLength(255)
        ]
      ],
    });
  }

  onSubmit() {
    this.namesForm.value.first_name = this.namesForm.value.first_name.trim();
    this.namesForm.value.last_name = this.namesForm.value.last_name.trim();
    if (this.namesForm.value.first_name === this.user?.first_name && this.namesForm.value.last_name === this.user?.last_name) {
      this.toastService.show('The first and last names is identical to the old names.');
      this.namesForm.setValue({ first_name: '' });
      this.namesForm.touched;
      return;
    }
    if (this.namesForm.valid) {
      const updateUserData: UserUpdateDto = {
        first_name: this.namesForm.value.first_name,
        last_name: this.namesForm.value.last_name,
      }
      this.profileService.updateUser(updateUserData).subscribe({
        next: () => {
          this.toastService.show('User updated successfully.');
          this.backToProfile();
        }
      });
    } else {
      this.namesForm.touched;
    }
  }
}
