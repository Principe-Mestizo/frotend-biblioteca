import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';

const MATERIAL_MODULES = [
  MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule,
  MatTableModule, MatPaginatorModule, MatSortModule, MatTooltipModule,MatSelectModule
];

type ActionIcon = 'visibility' | 'edit' | 'delete'; // Añade aquí todos los iconos que planeas usar

export interface ColumnConfig<T> {
  name: Extract<keyof T, string> | string;
  header: string;
  sortable?: boolean;
  formatter?: (item: T) => string | { text: string; class: string };
  filterable?: boolean;  // Añade esta línea
  filterOptions?: { value: string; viewValue: string }[];

}

@Component({
  selector: 'app-tabla-generica',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_MODULES],
  templateUrl: './tabla-generica.component.html',
  styleUrls: ['./tabla-generica.component.scss']
})
export class TablaGenericaComponent<T extends { [key: string]: any }> implements OnInit, AfterViewInit {

  actionColors: Record<ActionIcon, string> = {
    'visibility': '#8a09bdee',
    'edit': '#1f516f',
    'delete': '#e70b0b'
  };

  @Input() columns: ColumnConfig<T>[] = [];
  @Input() dataSource: MatTableDataSource<T> = new MatTableDataSource<T>([]);
  @Input() addButtonText: string = 'Agregar';
  @Input() addButtonIcon: string = 'person_add';
  @Input() searchPlaceholder: string = 'Buscar';
  @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
  @Input() defaultPageSize: number = 8;
  @Input() defaultSortColumn: string = '';
  @Input() defaultSortDirection: 'asc' | 'desc' = 'asc';
  @Input() isLoading: boolean = false;
  @Input() error: string | null = null;
  @Input() showStatusFilter: boolean = false;
  @Input() statusOptions: { value: string, viewValue: string }[] = [];
  @Input() actions: { icon: string, tooltip: string, action: (item: T) => void }[] = [];

  @Output() add = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();

  displayedColumns: string[] = [];
  selectedStatus: string = 'all';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.displayedColumns = this.columns.map(col => col.name);
    if (this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }
    this.dataSource.filterPredicate = (data: T, filter: string) => {
      const transformedFilter = JSON.parse(filter);
      const searchTermMatch = Object.keys(data).some(key => {
        return ('' + data[key as keyof T]).toLowerCase().includes(transformedFilter.searchTerm);
      });
      const statusMatch = transformedFilter.status === 'all' || data['estado'] === transformedFilter.status;
      return searchTermMatch && statusMatch;
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.sort.active = this.defaultSortColumn;
    this.sort.direction = this.defaultSortDirection;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const status = this.selectedStatus || 'all';
    this.dataSource.filter = JSON.stringify({ searchTerm: filterValue, status: status });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  hasFilterableColumn(): boolean {
    return this.columns.some(col => col.filterOptions);
  }
  
  getFilterOptions(): { value: string; viewValue: string }[] {
    const filterableColumn = this.columns.find(col => col.filterOptions);
    return filterableColumn?.filterOptions || [];
  }
  
  filterByStatus(status: string) {
    this.selectedStatus = status;
    const filterValue = (document.querySelector('input[matInput]') as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = JSON.stringify({ searchTerm: filterValue, status: status });
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getActionColor(icon: string): string {
    if (this.isActionIcon(icon)) {
      return this.actionColors[icon];
    }
    return '';
  }

  private isActionIcon(icon: string): icon is ActionIcon {
    return icon in this.actionColors;
  }

  onAdd() {
    this.add.emit();
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }

  onSortChange(sort: Sort) {
    this.sortChange.emit(sort);
  }

  getCellValue(item: T, column: ColumnConfig<T>): { text: string; class?: string; isImage?: boolean; src?: string } {
    if (column.name === 'imagen') {
      return {
        text: '',
        isImage: true,
        src: String(item[column.name as keyof T]),
        class: 'w-14 h-14 object-cover rounded-full'
      };
    }

    if (column.formatter) {
      const formatted = column.formatter(item);
      if (typeof formatted === 'string') {
        return { text: formatted };
      }
      return formatted;
    }
    return { text: String(item[column.name as keyof T]) };
  }

  isFormattedValue(value: { text: string; class?: string }): value is { text: string; class: string } {
    return 'class' in value;
  }
}

