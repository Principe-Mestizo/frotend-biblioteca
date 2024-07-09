import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../core/services/common/auth.service';
import { MENU_ITEMS, MenuItem, ValidRole } from '../../../../shared/config/menu.items';
import { map, Observable } from 'rxjs';
import { User } from '../../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, MatButtonModule, MatIconModule, CommonModule, MatMenuModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export default class MainLayoutComponent {
  menuItems: MenuItem[] = MENU_ITEMS;
  private authService = inject(AuthService);
  user$: Observable<User | null> = this.authService.user$;

  logout() {
    this.authService.logout();
  }
  hasRole(roles: ValidRole[]): Observable<boolean> {
    return this.user$.pipe(
      map(user => {
        if (!user) return false;
        return roles.includes(user.tipo_usuario as ValidRole);
      })
    );
  }
 
}