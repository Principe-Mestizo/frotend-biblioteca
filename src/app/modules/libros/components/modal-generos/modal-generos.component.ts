import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GenerosService } from '../../../../core/services/generos.service';
import { IGenerosResponse } from '../../../../core/interfaces/generos.interface';


const MATERIAL_MODULES = [
  MatDialogModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
];

@Component({
  selector: 'app-modal-generos',
  standalone: true,
  imports: [MATERIAL_MODULES, ReactiveFormsModule, CommonModule],
  templateUrl: './modal-generos.component.html',
  styleUrl: './modal-generos.component.scss'
})
export class ModalGenerosComponent {
  isLoading: boolean = false;
  operation: string = 'Agregar';
  GenerosForm!: FormGroup;
  id: string | undefined;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalGenerosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private generosService: GenerosService,
    private snackBar: MatSnackBar
  ) {
    this.id = data?.id;
    this.operation = this.id ? 'Editar' : 'Agregar';
    this.initForm();
  }

  private initForm(): void {
    this.GenerosForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    });
  }

  get nombreControl() { return this.GenerosForm.get('nombre'); }

  ngOnInit(): void {
    if (this.id) {
      this.isLoading = true;
      this.loadAutorData();
    }
  }

  loadAutorData(): void {
    this.generosService.getGeneroById(this.id!).subscribe({
      next: (autor: IGenerosResponse) => {
        this.GenerosForm.patchValue(autor);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los datos del autor', error);
        this.isLoading = false;
        this.showNotification('Error al cargar los datos del autor', 'error');
      }
    });
  }

  saveAutor(): void {
    if (this.GenerosForm.valid) {
      const autorData: Partial<IGenerosResponse> = {
        ...this.GenerosForm.value,
      };

      if (this.id) {
        if (this.GenerosForm.dirty) {
          this.generosService.updateGenero(this.id, autorData).subscribe({
            next: () => {
              this.dialogRef.close(true);
              this.showNotification('Autor actualizado con éxito', 'success');
            },
            error: (error) => {
              console.error('Error al actualizar el autor', error);
              this.showNotification('Error al actualizar el autor', 'error');
            },
          });
        } else {
          this.showNotification('No hay cambios para actualizar', 'info');
        }
      } else {
        this.generosService.createGenero(autorData).subscribe({
          next: () => {
            this.dialogRef.close(true);
            this.showNotification('Autor agregado con éxito', 'success');
          },
          error: (error) => {
            console.error('Error al agregar el autor', error);
            this.showNotification('Error al agregar el autor', 'error');
          },
        });
      }
    }
  }

  cancelar() {
    this.dialogRef.close(false);
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] :
                  type === 'error' ? ['error-snackbar'] : ['info-snackbar']
    });
  }
}
