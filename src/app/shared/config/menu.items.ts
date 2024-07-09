export type ValidRole = 'personal' | 'estudiante';

export interface MenuItem {
  path: string;
  title: string;
  icon: string;
  roles: ValidRole[];
  children?: MenuItem[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    path: './dashboard',
    title: 'Home',
    icon: 'dashboard',
    roles: ['personal', 'estudiante'],
  },
  {
    path: './libros',
    title: 'Libros',
    icon: 'library_books',
    roles: ['personal',],

  },
  {
    path: './libros/generos',
    title: 'Géneros',
    icon: 'category',
    roles: ['personal',],
  },
  {
    path: './libros/autores',
    title: 'Autores',
    icon: 'person',
    roles: ['personal',],
  },

  {
    path: './prestamos',
    title: 'Préstamos',
    icon: 'import_contacts',
    roles: ['personal',],
  },

];