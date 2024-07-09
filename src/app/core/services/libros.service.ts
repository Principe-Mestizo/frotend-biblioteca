import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILibroResponse } from '../interfaces/libros.interface';

@Injectable({
  providedIn: 'root'
})
export class LibrosService {
  private readonly BASE_URL = environment.apiURL;
  private http = inject(HttpClient);

  getLibros():Observable<ILibroResponse[] >{
    return  this.http.get<ILibroResponse[]>(`${this.BASE_URL}/libros`);
  }

  getLibroById(id: string): Observable<ILibroResponse> {
    return this.http.get<ILibroResponse>(`${this.BASE_URL}/libros/${id}`);
  }

  createLibro(libro: Partial<ILibroResponse>): Observable<ILibroResponse> {
    return this.http.post<ILibroResponse>(`${this.BASE_URL}/libros`, libro);
  }

  updateLibro(id: string, libro: Partial<ILibroResponse>): Observable<ILibroResponse> {
    return this.http.put<ILibroResponse>(`${this.BASE_URL}/libros/${id}`, libro);
  }

  deleteLibro(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/libros/${id}`);
  }

}
