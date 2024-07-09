import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ColumnConfig, TablaGenericaComponent } from '../../../../shared/components/tabla-generica/tabla-generica.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { ILibroResponse } from '../../../../core/interfaces/libros.interface';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { LibrosService } from '../../../../core/services/libros.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalGenericoComponent } from '../../../../shared/components/modal-generico/modal-generico.component';
import { ModalLibrosComponent } from '../../components/modal-libros/modal-libros.component';

const MATERIAL_MODULES = [MatProgressSpinnerModule]

@Component({
  selector: 'app-libros-list',
  standalone: true,
  imports: [MATERIAL_MODULES, TablaGenericaComponent, CommonModule],
  template: `
    <div class="bg-[#FFFFFF] p-4 rounded-xl relative min-h-[400px]">
      <ng-container *ngIf="isLoading; else tableContent">
        <div class="absolute inset-0 flex items-center justify-center bg-white">
          <div class="flex flex-col items-center">
            <mat-spinner diameter="64"></mat-spinner>
            <p class="mt-4 text-2xl font-semibold text-gray-700">Cargando datos espere...</p>
          </div>
        </div>
      </ng-container>

      <ng-template #tableContent>
        <app-tabla-generica [columns]="columns" [dataSource]="dataSource" [addButtonText]="'Agregar Libro'"
          [searchPlaceholder]="'Buscar Libros'" [actions]="actions" (add)="openAddEditLibro()"
          (pageChange)="onPageChange($event)" (sortChange)="onSortChange($event)">
        </app-tabla-generica>
      </ng-template>
    </div>
  `,
})
export default class LibrosListComponent implements OnInit {
  isLoading: boolean = true;
  columns: ColumnConfig<ILibroResponse>[] = [
    { name: 'id', header: 'ID' },
    { name: 'titulo', header: 'Título' },
    { name: 'nombre_autor', header: 'Autor' },
    {
      name: 'imagen',
      header: 'Imagen',
      sortable: false,
      filterable: false
    },
    { name: 'nombre_genero', header: 'Género' },
    { name: 'descripcion', header: 'Descripcion' },
    {
      name: 'estado',
      header: 'Estado',
      filterOptions: [
        { value: 'disponible', viewValue: 'Disponible' },
        { value: 'prestado', viewValue: 'Prestado' },
        { value: 'reservado', viewValue: 'Reservado' }
      ]
    },
  ]

  actions = [
    { icon: 'edit', tooltip: 'Editar', action: (libro: ILibroResponse) => this.openAddEditLibro(libro.id) },
    { icon: 'delete', tooltip: 'Eliminar', action: (libro: ILibroResponse) => this.onDeleteLibro(libro) },
    { icon: 'visibility', tooltip: 'Ver', action: (libro: ILibroResponse) => this.onViewLibro(libro) },
  ]

  @ViewChild(TablaGenericaComponent) tablaGenerica!: TablaGenericaComponent<ILibroResponse>;
  dataSource: MatTableDataSource<ILibroResponse> = new MatTableDataSource<ILibroResponse>([]);

  private _librosService = inject(LibrosService);
  private _dialog = inject(MatDialog);
  private _cdr = inject(ChangeDetectorRef);

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDataSource()
  }

  loadDataSource() {
    this.isLoading = true;
    this._librosService.getLibros().subscribe({
      next: (libros: ILibroResponse[]) => {
        this.dataSource.data = libros;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error al cargar libros", error);
        this.isLoading = false;
      }
    })
  }

  openAddEditLibro(id?: string): void {
    const dialogRef = this._dialog.open(ModalLibrosComponent, {
      width: '550px',
      disableClose: true,
      data: { id: id },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDataSource();
      }
    });
  }

  onDeleteLibro(libro: ILibroResponse) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Este proceso no es reversible. Está a punto de eliminar el libro: "${libro.titulo}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        title: 'text-lg font-bold text-gray-800',
        cancelButton: 'bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring focus:border-red-500',
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring focus:border-blue-500'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteLibro(libro.id);
      }
    });
  }

  deleteLibro(libroId: string) {
    this._librosService.deleteLibro(libroId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Eliminado',
          text: 'El libro ha sido eliminado con éxito.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.loadDataSource();
      },
      error: (error) => {
        console.error("Error al eliminar el libro", error);
        Swal.fire('Error', 'No se pudo eliminar el libro. Por favor, intente de nuevo.', 'error');
      }
    });
  }

  onViewLibro(libro: ILibroResponse) {
    this._librosService.getLibroById(libro.id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (libroDetallado) => {
        this._dialog.open(ModalGenericoComponent, {
          width: '550px',
          data: {
            title: 'Detalles del Libro',
            entity: libroDetallado,
            fields: [
              { key: 'id', label: 'ID' },
              { key: 'titulo', label: 'Título' },
              { key: 'nombre_autor', label: 'Autor' },
              { key: 'nombre_genero', label: 'Genero' },
              { key: 'descripcion', label: 'Descripcion' },
              { key: 'estado', label: 'Estado' },
              { key: 'imagen', label: 'Imagen', isImage:true },

            ]
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener detalles del libro', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onPageChange(event: PageEvent) {
    // Implementar lógica de paginación si es necesario
  }

  onSortChange(sort: Sort) {
    // Implementar lógica de ordenación si es necesario
  }
}