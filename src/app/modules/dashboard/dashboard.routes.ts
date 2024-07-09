import { Routes } from "@angular/router";


export const DASHBOAR_ROUTES: Routes  = [

    {
        path: '',
        loadComponent:() => import('./pages/dashboard-page/dashboard-page.component'), 
    }
]