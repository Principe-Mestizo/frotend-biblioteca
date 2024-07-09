import { Routes } from "@angular/router";
import MainLayoutComponent from "./layout/main-layout/main-layout.component";
import { roleGuard } from "../../core/guards/role.guard";
export const ADMIN_ROUTES: Routes = [

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashbaoard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadChildren: () => import('../dashboard/dashboard.routes').then(m => m.DASHBOAR_ROUTES),
        title: 'App - Dashboard',
        canActivate: [roleGuard]


      },
      {
        path: 'libros',
        loadChildren: () => import('../libros/libros.routes').then(m => m.LIBROS_ROUTES),
        title: 'App - Libros',
        canActivate: [roleGuard]


      },
      {
        path: 'reservas',
        loadChildren: () => import('../reservas/reservas.routes').then(m => m.RESERVA_ROUTE),
        title: 'App - Reservas',
        canActivate: [roleGuard]


      },

      {
        path: 'prestamos',
        loadChildren: () => import('../prestamos/prestamos.routes').then(m => m.PRESTAMO_ROUTE),
        title: 'App - Prestamos',
        canActivate: [roleGuard]


      },


    ]
  }
]
