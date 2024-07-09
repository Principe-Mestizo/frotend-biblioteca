import { Routes } from "@angular/router";



export const LIBROS_ROUTES: Routes = [

  {
    path: 'lista-libros',
    loadComponent: () =>import('./pages/libros-list/libros-list.component'),
  },

  {
    path: 'generos',
    loadComponent: () =>import('./pages/generos-list/generos-list.component'),
  },

  {
    path: 'autores',
    loadComponent: () =>import('./pages/autores-list/autores-list.component'),
  },
  {

    path: '**',
    redirectTo: 'lista-libros',
    pathMatch: 'full'
  }

]