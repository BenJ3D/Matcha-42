import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../services/auth.service";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {ProfileService} from "../../../services/profile.service";
import {UserResponseDto} from "../../../DTOs/users/UserResponseDto";
import {ToastService} from "../../../services/toast.service";

@Component({
  selector: 'app-change-email',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './change-email.component.html',
  styleUrl: './change-email.component.scss'
})
export class ChangeEmailComponent implements OnInit {
  @Input() backToProfile!: () => void;
  @Input() user!: UserResponseDto | null;
  protected isLoading = false;

  emailForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private toastService: ToastService,
  ) {
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.emailForm = this.fb.group({
      newEmail: [
        this.user?.email ?? '',
        [
          Validators.required,
          Validators.email,
          Validators.minLength(10),
          Validators.maxLength(254)
        ]
      ],
    });
  }

  onSubmit() {
    if (this.emailForm.value.newEmail === this.user?.email) {
      this.toastService.show('The email is identical to the old email.');
      this.emailForm.setValue({newEmail: ''});
      this.emailForm.touched;
      return;
    }
    if (this.emailForm.valid) {
      this.isLoading = true;
      this.profileService.updateEmail(this.emailForm.value.newEmail).subscribe({
        next: () => {
          this.isLoading = false;
          this.authService.logout();
        },
        error: () => {
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;

        }
      });
    } else {
      this.emailForm.touched;
    }
  }
}
