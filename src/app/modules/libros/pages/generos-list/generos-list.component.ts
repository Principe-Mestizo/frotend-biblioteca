import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ColumnConfig, TablaGenericaComponent } from '../../../../shared/components/tabla-generica/tabla-generica.component';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { IGenerosResponse } from '../../../../core/interfaces/generos.interface';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { ModalGenericoComponent } from '../../../../shared/components/modal-generico/modal-generico.component';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { GenerosService } from '../../../../core/services/generos.service';
import { ModalGenerosComponent } from '../../components/modal-generos/modal-generos.component';
const MATERIAL_MODULES = [MatProgressSpinnerModule]

@Component({
  selector: 'app-generos-list',
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
        <app-tabla-generica [columns]="columns" [dataSource]="dataSource" [addButtonText]="'Agregar Genero'"
          [searchPlaceholder]="'Buscar Generos'" [actions]="actions" (add)="openAddEditGenero()"
          (pageChange)="onPageChange($event)" (sortChange)="onSortChange($event)">
        </app-tabla-generica>
      </ng-template>
    </div>

  `,
})
export default class GenerosListComponent implements OnInit {
  isLoading: boolean = true;
  columns: ColumnConfig<IGenerosResponse>[] = [
    { name: 'id', header: 'ID' },
    { name: 'nombre', header: 'Nombre Genero' },

  ]

  actions = [
    { icon: 'edit', tooltip: 'Editar', action: (Genero: IGenerosResponse) => this.openAddEditGenero(Genero.id) },
    { icon: 'delete', tooltip: 'Eliminar', action: (Genero: IGenerosResponse) => this.onDeleteGenero(Genero) },
    { icon: 'visibility', tooltip: 'Ver', action: (Genero: IGenerosResponse) => this.onViewGenero(Genero) },
  ]

  @ViewChild(TablaGenericaComponent) tablaGenerica!: TablaGenericaComponent<IGenerosResponse>;
  dataSource: MatTableDataSource<IGenerosResponse> = new MatTableDataSource<IGenerosResponse>([]);

  private _GenerosService = inject(GenerosService);
  private _dialog = inject(MatDialog);
  private _cdr = inject(ChangeDetectorRef);

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDataSource()
  }

  loadDataSource() {
    this.isLoading = true;
    this._GenerosService.getGeneros().subscribe({
      next: (Generos: IGenerosResponse[]) => {
        this.dataSource.data = Generos;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error al cargar Generos", error);
        this.isLoading = false;
      }
    })
  }

  openAddEditGenero(id?: string): void {
    const dialogRef = this._dialog.open(ModalGenerosComponent, {
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

  onDeleteGenero(Genero: IGenerosResponse) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Este proceso no es reversible. Está a punto de eliminar el Genero: "${Genero.nombre}"`,
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
        this.deleteGenero(Genero.id);
      }
    });
  }

  deleteGenero(GeneroId: string) {
    this._GenerosService.deleteGenero(GeneroId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Eliminado',
          text: 'El Genero ha sido eliminado con éxito.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.loadDataSource();
      },
      error: (error) => {
        console.error("Error al eliminar el Genero", error);
        Swal.fire('Error', 'No se pudo eliminar el Genero. Por favor, intente de nuevo.', 'error');
      }
    });
  }

  onViewGenero(Genero: IGenerosResponse) {
    this._GenerosService.getGeneroById(Genero.id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (GeneroDetallado) => {
        this._dialog.open(ModalGenericoComponent, {
          width: '550px',
          data: {
            title: 'Detalles del Genero',
            entity: GeneroDetallado,
            fields: [
              { key: 'id', label: 'ID' },
              { key: 'nombre', label: 'Nombre Genero' },

            ]
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener detalles del Genero', error);
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
