// dashboard-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { LibrosService } from '../../../../core/services/libros.service';
import { PrestamoService } from '../../../../core/services/prestamos.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/common/auth.service';
import { User } from '../../../../core/interfaces/auth.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ILibroResponse } from '../../../../core/interfaces/libros.interface';
import { IGenerosResponse } from '../../../../core/interfaces/generos.interface';
import { CommonModule } from '@angular/common';
import { GenerosService } from '../../../../core/services/generos.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatButtonModule, MatInputModule, MatSnackBarModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, MatCardModule],
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export default class DashboardPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private prestamoService = inject(PrestamoService);
  private librosService = inject(LibrosService);
  private generosService = inject(GenerosService);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  user$: Observable<User | null> = this.authService.user$;
  prestamoForm: FormGroup;
  filterForm!: FormGroup;

  libros: ILibroResponse[] = [];
  generos: IGenerosResponse[] = [];
  showPrestamoModal = false;
  selectedLibro: ILibroResponse | null = null;
  currentUser: User | null = null;
  filteredLibros: ILibroResponse[] = [];

  constructor() {
    this.prestamoForm = this.fb.group({
      libro_id: ['', Validators.required],
      usuario_id: [{ value: '', disabled: true }, Validators.required],
      fecha_prestamo: [new Date(), Validators.required]
    });

    this.filterForm = this.fb.group({
      titulo: [''],
      nombre_autor: [''],
      nombre_genero: ['']
    });
  }

  ngOnInit() {
    this.loadLibros();
    this.loadGeneros(); // Carga los géneros al iniciar el componente
    this.user$.subscribe(user => {
      this.currentUser = user;
      if (this.currentUser) {
        this.prestamoForm.patchValue({
          usuario_id: this.currentUser.id
        });
      }
    });
  }

  loadLibros() {
    this.librosService.getLibros().subscribe(
      libros => {
        this.libros = libros;
        this.filteredLibros = libros;
      },
      error => console.error('Error cargando libros', error)
    );
  }

  loadGeneros() {
    this.generosService.getGeneros().subscribe(
      generos => {
        this.generos = generos;
      },
      error => console.error('Error cargando géneros', error)
    );
  }

  applyFilters() {
    const filters = this.filterForm.value;

    this.filteredLibros = this.libros.filter(libro => {
      return (
        (!filters.titulo || libro.titulo.toLowerCase().includes(filters.titulo.toLowerCase())) &&
        (!filters.nombre_autor || libro.nombre_autor.toLowerCase().includes(filters.nombre_autor.toLowerCase())) &&
        (!filters.nombre_genero || libro.nombre_genero === filters.nombre_genero)
      );
    });
  }

  resetFilters() {
    this.filterForm.reset({
      titulo: '',
      nombre_autor: '',
      nombre_genero: ''
    });
    this.filteredLibros = this.libros; // Mostrar todos los libros nuevamente
  }

  openPrestamoModal(libro: ILibroResponse) {
    if (libro.estado === 'PRESTADO') {
      this.snackBar.open('El libro ya está prestado', 'Cerrar', { duration: 3000 });
      return;
    }

    this.selectedLibro = libro;
    this.prestamoForm.patchValue({
      libro_id: libro.id,
      usuario_id: this.currentUser ? this.currentUser.id : ''
    });
    this.showPrestamoModal = true;
  }

  closePrestamoModal() {
    this.showPrestamoModal = false;
    this.selectedLibro = null;
    this.prestamoForm.reset({
      usuario_id: this.currentUser ? this.currentUser.id : '',
      fecha_prestamo: new Date()
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.prestamoForm.valid && this.currentUser) {
      const formValue = {
        ...this.prestamoForm.value,
        usuario_id: this.currentUser.id,
        fecha_prestamo: this.formatDate(this.prestamoForm.get('fecha_prestamo')?.value)
      };
      this.prestamoService.createPrestamo(formValue).subscribe(
        response => {
          this.snackBar.open('Préstamo realizado con éxito', 'Cerrar', { duration: 3000 });
          this.closePrestamoModal();
        },
        error => {
          this.snackBar.open('Error al realizar el préstamo', 'Cerrar', { duration: 3000 });
          console.error('Error en el préstamo', error);
        }
      );
    }
  }
}
