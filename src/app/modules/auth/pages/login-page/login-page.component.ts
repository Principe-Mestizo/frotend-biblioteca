import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { EMPTY, catchError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../core/services/common/auth.service';
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export  default class LoginPageComponent {

  private readonly _authService = inject(AuthService);

  hidePassword = true;
  validateForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    email: ['estudiante@senati.pe', [Validators.required, Validators.email]],
    password: ['contraseña123', [Validators.required]],
  });
  constructor(private fb: NonNullableFormBuilder) {}

  submitForm(): void {
    if (this.validateForm.valid) {
      const {email, password} = this.validateForm.getRawValue();
      this._authService.login(email, password).pipe(
        catchError((error: HttpErrorResponse) => {
           if (error.status === 400) {
              this.showInvalidCredentialsError();
              return EMPTY;
           }
           this.showUnexpectedError();
           throw error;
        })
     ).subscribe();

    } else {
      Object.values(this.validateForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }


  }

  private showInvalidCredentialsError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Credenciales incorrectas',
      text: 'Por favor, verifique sus credenciales e inténtelo nuevamente.',
    });
  }

  private showUnexpectedError(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Ocurrió un error inesperado. Por favor, inténtelo nuevamente más tarde.',
    });
  }

}
