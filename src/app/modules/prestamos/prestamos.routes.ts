import { Routes } from "@angular/router";



export const PRESTAMO_ROUTE: Routes  = [
  {
    path: 'lista-prestamos',
    loadComponent: () => import('./pages/prestamos-list/prestamos-list.component'),
  },
  {
    path: '**',
    redirectTo: 'lista-prestamos'
  }
]
