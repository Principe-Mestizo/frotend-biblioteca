import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { ColumnConfig, TablaGenericaComponent } from '../../../../shared/components/tabla-generica/tabla-generica.component';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ModalGenericoComponent } from '../../../../shared/components/modal-generico/modal-generico.component';
import { IPrestamoResponse } from '../../../../core/interfaces/prestamo.interface';
import { PrestamoService } from '../../../../core/services/prestamos.service';
import * as XLSX from 'xlsx';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

const MATERIAL_MODULES = [MatProgressSpinnerModule, MatButtonModule, MatIconModule]

@Component({
  selector: 'app-prestamos-list',
  standalone: true,
  imports: [MATERIAL_MODULES, TablaGenericaComponent, CommonModule, ],
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
        <button mat-raised-button color="primary" (click)="exportToExcel()" class="mb-4">
        <mat-icon>insert_drive_file</mat-icon>
        Exportar a Excel
        </button>
        <app-tabla-generica [columns]="columns" [dataSource]="dataSource" [addButtonText]="'Agregar Préstamo'"
          [searchPlaceholder]="'Buscar Préstamos'" [actions]="actions"
          (pageChange)="onPageChange($event)" (sortChange)="onSortChange($event)">
        </app-tabla-generica>
      </ng-template>
    </div>
  `,
})
export default class PrestamosListComponent implements OnInit {
  isLoading: boolean = true;
  columns: ColumnConfig<IPrestamoResponse>[] = [
    { name: 'prestamo_id', header: 'ID Préstamo' },
    { name: 'libro_titulo', header: 'Título del Libro' },
    { name: 'usuario_nombre', header: 'Nombre del Usuario' },
    { name: 'fecha_prestamo', header: 'Fecha de Préstamo' },
    { name: 'fecha_devolucion_esperada', header: 'Fecha de Devolución Esperada' },
  ]

  actions = [
    { icon: 'delete', tooltip: 'Eliminar', action: (prestamo: IPrestamoResponse) => this.onDeletePrestamo(prestamo) },
    { icon: 'visibility', tooltip: 'Ver', action: (prestamo: IPrestamoResponse) => this.onViewPrestamo(prestamo) },
  ]

  @ViewChild(TablaGenericaComponent) tablaGenerica!: TablaGenericaComponent<IPrestamoResponse>;
  dataSource: MatTableDataSource<IPrestamoResponse> = new MatTableDataSource<IPrestamoResponse>([]);

  private _prestamosService = inject(PrestamoService);
  private _dialog = inject(MatDialog);
  private _cdr = inject(ChangeDetectorRef);

  private unsubscribe$ = new Subject<void>();

  ngOnInit(): void {
    this.loadDataSource()
  }

  loadDataSource() {
    this.isLoading = true;
    this._prestamosService.getPrestamos().subscribe({
      next: (prestamos: IPrestamoResponse[]) => {
        this.dataSource.data = prestamos;
        this.isLoading = false;
        this._cdr.detectChanges();
      },
      error: (error) => {
        console.error("Error al cargar préstamos", error);
        this.isLoading = false;
      }
    })
  }

  openAddEditPrestamo(id?: string): void {
    //TODO: si es necesario
  }

  onDeletePrestamo(prestamo: IPrestamoResponse) {
    Swal.fire({
      title: '¿Está seguro?',
      text: `Este proceso no es reversible. Está a punto de eliminar el préstamo del libro: "${prestamo.libro_titulo}"`,
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
        this.deletePrestamo(prestamo.prestamo_id);
      }
    });
  }



  deletePrestamo(prestamoId: string) {
    this._prestamosService.deletePrestamo(prestamoId).subscribe({
      next: () => {
        Swal.fire({
          title: 'Eliminado',
          text: 'El préstamo ha sido eliminado con éxito.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        this.loadDataSource();
      },
      error: (error) => {
        console.error("Error al eliminar el préstamo", error);
        Swal.fire('Error', 'No se pudo eliminar el préstamo. Por favor, intente de nuevo.', 'error');
      }
    });
  }

  onViewPrestamo(prestamo: IPrestamoResponse) {
    this._prestamosService.getPrestamoById(prestamo.prestamo_id)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe({
      next: (prestamoDetallado) => {
        this._dialog.open(ModalGenericoComponent, {
          width: '550px',
          data: {
            title: 'Detalles del Préstamo',
            entity: prestamoDetallado,
            fields: [
              { key: 'prestamo_id', label: 'ID Préstamo' },
              { key: 'libro_titulo', label: 'Título del Libro' },
              { key: 'usuario_nombre', label: 'Nombre del Usuario' },
              { key: 'fecha_prestamo', label: 'Fecha de Préstamo' },
              { key: 'fecha_devolucion_esperada', label: 'Fecha de Devolución Esperada' },
            ]
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener detalles del préstamo', error);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onPageChange(event: PageEvent) {
  }

  onSortChange(sort: Sort) {

  }

  exportToExcel(): void {
    const data = this.dataSource.data.map(item => ({
      'ID Préstamo': item.prestamo_id,
      'Título del Libro': item.libro_titulo,
      'Nombre del Usuario': item.usuario_nombre,
      'Fecha de Préstamo': item.fecha_prestamo,
      'Fecha de Devolución Esperada': item.fecha_devolucion_esperada
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prestamos');

    XLSX.writeFile(wb, 'prestamos.xlsx');
  }
}