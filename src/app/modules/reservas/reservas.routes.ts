import { Routes } from "@angular/router";



export const RESERVA_ROUTE: Routes  = [
  {
    path: 'lista-reserva',
    loadComponent: () => import('./pages/reservas-list/reservas-list.component'),

  },
  {
    path: '**',
    redirectTo: 'lista-reserva'
  }
]
