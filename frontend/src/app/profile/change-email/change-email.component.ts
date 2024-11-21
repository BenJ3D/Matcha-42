import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EEditStep } from "../profile.component";
import { MatIcon } from "@angular/material/icon";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { MatError, MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

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

  emailForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.emailForm = this.fb.group({
      newEmail: [
        '',
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
    if (this.emailForm.valid) {
      console.log('Formulaire valide :', this.emailForm.value);
      // Add your email update logic here
    } else {
      console.log('Formulaire invalide.');
    }
  }
}
