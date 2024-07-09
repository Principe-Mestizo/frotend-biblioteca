import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ColumnConfig, TablaGenericaComponent } from '../../../../shared/components/tabla-generica/tabla-generica.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IAutoresResponse } from '../../../../core/interfaces/autores.interface';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AutoresService } from '../../../../core/services/autores.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { ModalGenericoComponent } from '../../../../shared/components/modal-generico/modal-generico.component';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ModalAutoresComponent } from '../../components/modal-autores/modal-autores.component';
const MATERIAL_MODULES = [MatProgressSpinnerModule]

@Component({
  selector: 'app-autores-list',
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
        <app-tabla-generica [columns]="columns" [dataSource]="dataSource" [addButtonText]="'Agregar Autores'"
          [searchPlaceholder]="'Buscar Autores'" [actions]="actions" (add)="openAddEditAutores()"
          (pageChange)="onPageChange($event)" (sortChange)="onSortChange($event)">
        </app-tabla-generica>
      </ng-template>
    </div>

  `,
})
export  default class AutoresListComponent implements OnInit{


  isLoading: boolean = true;
  columns: ColumnConfig<IAutoresResponse>[] = [
    { name: 'id', header: 'ID' },
    { name: 'nombre', header: 'Nombre Autores' },

  ]

  actions = [
    { icon: 'edit', tooltip: 'Editar', action: (Autores: IAutoresResponse) => this.openAddEditAutores(Autores.id) },
    { icon: 'delete', tooltip: 'Eliminar', action: (Autores: IAutoresResponse) => this.onDeleteAutores(Autores) },
    { icon: 'visibility', tooltip: 'Ver', action: (Autores: IAutoresResponse) => this.onViewAutores(Autores) },
  ]

  @ViewChild(TablaGenericaComponent) tablaGenerica!: TablaGenericaComponent<IAutoresResponse>;
  dataSource: MatTableDataSource<IAutoresResponse> = new MatTableDataSource<IAutoresResponse>([]);

  private _AutoresService = inject(AutoresService);
  private _dialog = inject(MatDialog);
  private _cdr = inject(ChangeDetectorRef);

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDataSource()
  }

  loadDataSource() {
    this.isLoading = true;
    this._AutoresService.getAutores().subscribe({
      next: (Autores: IAutoresResponse[]) => {
        this.dataSource.data = Autores;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error al cargar Autores", error);
        this.isLoading = false;
      }
    })
  }

  openAddEditAutores(id?: string): void {
    const dialogRef = this._dialog.open(ModalAutoresComponent, {
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

  onDeleteAutores(Autores: IAutoresResponse) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Este proceso no es reversible. Está a punto de eliminar el Autores: "${Autores.nombre}"`,
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
        this.deleteAutores(Autores.id);
      }
    });
  }

  deleteAutores(AutoresId: string) {
    this._AutoresService.deleteAutores(AutoresId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Eliminado',
          text: 'El Autores ha sido eliminado con éxito.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.loadDataSource();
      },
      error: (error) => {
        console.error("Error al eliminar el Autores", error);
        Swal.fire('Error', 'No se pudo eliminar el Autores. Por favor, intente de nuevo.', 'error');
      }
    });
  }

  onViewAutores(Autores: IAutoresResponse) {
    this._AutoresService.getAutoresById(Autores.id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (AutoresDetallado) => {
        this._dialog.open(ModalGenericoComponent, {
          width: '550px',
          data: {
            title: 'Detalles del Autores',
            entity: AutoresDetallado,
            fields: [
              { key: 'id', label: 'ID' },
              { key: 'nombre', label: 'Nombre Autor' },

            ]
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener detalles del Autores', error);
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
