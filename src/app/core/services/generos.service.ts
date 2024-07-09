import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IGenerosResponse } from '../interfaces/generos.interface';

@Injectable({
  providedIn: 'root'
})
export class GenerosService {

  private readonly BASE_URL = environment.apiURL;
  private http = inject(HttpClient);

  getGeneros():Observable<IGenerosResponse[] >{
    return  this.http.get<IGenerosResponse[]>(`${this.BASE_URL}/generos`);
  }

  getGeneroById(id: string): Observable<IGenerosResponse> {
    return this.http.get<IGenerosResponse>(`${this.BASE_URL}/generos/${id}`);
  }

  createGenero(Genero: Partial<IGenerosResponse>): Observable<IGenerosResponse> {
    return this.http.post<IGenerosResponse>(`${this.BASE_URL}/generos`, Genero);
  }

  updateGenero(id: string, Genero: Partial<IGenerosResponse>): Observable<IGenerosResponse> {
    return this.http.put<IGenerosResponse>(`${this.BASE_URL}/generos/${id}`, Genero);
  }

  deleteGenero(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/generos/${id}`);
  }

}
