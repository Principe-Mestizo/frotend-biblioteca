import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

interface GenericEntity {
  [key: string]: any
}


@Component({
  selector: 'app-modal-generico',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, CommonModule],
  template: `
  <h2 mat-dialog-title class="text-2xl font-bold uppercase text-center mb-4">
      {{ data.title }}
    </h2>

    <mat-dialog-content class="mat-typography">
      <div class="grid grid-cols-1  gap-4">
        <div *ngFor="let field of data.fields">
          <strong>{{ field.label }}:</strong>
          <span *ngIf="!field.isImage && !field.isBoolean">{{ data.entity[field.key] }}</span>
          <span *ngIf="field.isBoolean" [ngClass]="{'text-green-500': data.entity[field.key], 'text-red-500': !data.entity[field.key]}">
            {{ data.entity[field.key] ? 'Activo' : 'Inactivo' }}
          </span>
          <img *ngIf="field.isImage && data.entity[field.key]" [src]="data.entity[field.key]" [alt]="field.label" class="w-14 h-14 object-cover rounded-full">
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close color="warn">Cerrar</button>
    </mat-dialog-actions>

  `,
})
export class ModalGenericoComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      entity: GenericEntity;
      fields: { key: string; label: string; isImage?: boolean; isBoolean?: boolean }[];
    },
  ) {}

}
