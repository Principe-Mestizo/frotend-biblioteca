import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IPrestamoResponse } from '../interfaces/prestamo.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private readonly BASE_URL = environment.apiURL;
  private http = inject(HttpClient);

  getPrestamos():Observable<IPrestamoResponse[] >{
    return  this.http.get<IPrestamoResponse[]>(`${this.BASE_URL}/prestamos`);
  }


  getPrestamoById(id: string): Observable<IPrestamoResponse> {
    return this.http.get<IPrestamoResponse>(`${this.BASE_URL}/prestamos/${id}`);
  }

  createPrestamo(data: any): Observable<any> {
    return this.http.post<any>(`${this.BASE_URL}/prestamos`, data);
  }


  deletePrestamo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/prestamos/${id}`);
  }
}