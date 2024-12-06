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

@Component({
  selector: 'app-request-pass',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  templateUrl: './request-pass.component.html',
  styleUrl: './request-pass.component.scss'
})
export class RequestPassComponent implements OnInit {
  @Input() goBack!: () => void;

  requestNewPassForm!: FormGroup;
  isLoading = false;

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
    this.requestNewPassForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.maxLength(255),
        Validators.email
      ]
      ],
    });
  }

  onSubmit() {
    this.requestNewPassForm.value.email = this.requestNewPassForm.value.email.trim();
    if (this.requestNewPassForm.valid) {
      this.isLoading = true;
      const data: { email: string } = {
        email: this.requestNewPassForm.value.email,
      }
      this.profileService.requestNewPassword(data).subscribe({
        next: () => {
          this.toastService.show('Email send successfully.');
          this.goBack();
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
    } else {
      this.requestNewPassForm.touched;
    }
  }
}
