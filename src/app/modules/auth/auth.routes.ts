import { Routes } from "@angular/router"
import LoginPageComponent from './pages/login-page/login-page.component';


export const AUTH_ROUTES: Routes = [

    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginPageComponent
    }
]