import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LibrosService } from '../../../../core/services/libros.service';
import { AutoresService } from '../../../../core/services/autores.service';
import { GenerosService } from '../../../../core/services/generos.service';
import { ILibroResponse } from '../../../../core/interfaces/libros.interface';
import { IAutoresResponse } from '../../../../core/interfaces/autores.interface';
import { IGenerosResponse } from '../../../../core/interfaces/generos.interface';

const MATERIAL_MODULES = [
  MatDialogModule,
  MatInputModule,
  MatFormFieldModule,
  MatSelectModule,
  MatButtonModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
];

@Component({
  selector: 'app-modal-libros',
  standalone: true,
  imports: [MATERIAL_MODULES, ReactiveFormsModule, CommonModule],
  templateUrl: './modal-libros.component.html',
  styleUrl: './modal-libros.component.scss'
})
export class ModalLibrosComponent implements OnInit {
  isLoading: boolean = false;
  operation: string = 'Agregar';
  librosForm!: FormGroup;
  id: string | undefined;
  autores: IAutoresResponse[] = [];
  generos: IGenerosResponse[] = [];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModalLibrosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private librosService: LibrosService,
    private autoresService: AutoresService,
    private generosService: GenerosService,
    private snackBar: MatSnackBar
  ) {
    this.id = data?.id;
    this.operation = this.id ? 'Editar' : 'Agregar';
    this.initForm();
  }
  estadosLibro: string[] = ['disponible', 'prestado', 'reservado'];

  private initForm(): void {
    this.librosForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      autor_id: ['', Validators.required],
      imagen: [''],
      genero_id: ['', Validators.required],
      descripcion: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadAutores();
    this.loadGeneros();
    if (this.id) {
      this.isLoading = true;
      this.loadLibroData();
    }
  }

  loadAutores(): void {
    this.autoresService.getAutores().subscribe({
      next: (autores) => {
        this.autores = autores;
      },
      error: (error) => {
        console.error('Error al cargar autores', error);
        this.showNotification('Error al cargar autores', 'error');
      }
    });
  }

  loadGeneros(): void {
    this.generosService.getGeneros().subscribe({
      next: (generos) => {
        this.generos = generos;
      },
      error: (error) => {
        console.error('Error al cargar géneros', error);
        this.showNotification('Error al cargar géneros', 'error');
      }
    });
  }

  loadLibroData(): void {
    this.librosService.getLibroById(this.id!).subscribe({
      next: (libro: ILibroResponse) => {
        this.librosForm.patchValue(libro);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar los datos del libro', error);
        this.isLoading = false;
        this.showNotification('Error al cargar los datos del libro', 'error');
      }
    });
  }

  saveLibro(): void {
    if (this.librosForm.valid) {
      const libroData: Partial<ILibroResponse> = {
        ...this.librosForm.value,
      };

      if (this.id) {
        if (this.librosForm.dirty) {
          this.librosService.updateLibro(this.id, libroData).subscribe({
            next: () => {
              this.dialogRef.close(true);
              this.showNotification('Libro actualizado con éxito', 'success');
            },
            error: (error) => {
              console.error('Error al actualizar el libro', error);
              this.showNotification('Error al actualizar el libro', 'error');
            },
          });
        } else {
          this.showNotification('No hay cambios para actualizar', 'info');
        }
      } else {
        this.librosService.createLibro(libroData).subscribe({
          next: () => {
            this.dialogRef.close(true);
            this.showNotification('Libro agregado con éxito', 'success');
          },
          error: (error) => {
            console.error('Error al agregar el libro', error);
            this.showNotification('Error al agregar el libro', 'error');
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
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: type === 'success' ? ['success-snackbar'] :
                  type === 'error' ? ['error-snackbar'] : ['info-snackbar']
    });
  }
}