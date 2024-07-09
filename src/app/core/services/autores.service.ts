import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAutoresResponse } from '../interfaces/autores.interface';

@Injectable({
  providedIn: 'root'
})
export class AutoresService {

  private readonly BASE_URL = environment.apiURL;
  private http = inject(HttpClient);
  getAutores():Observable<IAutoresResponse[] >{
    return  this.http.get<IAutoresResponse[]>(`${this.BASE_URL}/autores`);
  }

  getAutoresById(id: string): Observable<IAutoresResponse> {
    return this.http.get<IAutoresResponse>(`${this.BASE_URL}/autores/${id}`);
  }

  createAutores(Autores: Partial<IAutoresResponse>): Observable<IAutoresResponse> {
    return this.http.post<IAutoresResponse>(`${this.BASE_URL}/autores`, Autores);
  }

  updateAutores(id: string, Autores: Partial<IAutoresResponse>): Observable<IAutoresResponse> {
    return this.http.put<IAutoresResponse>(`${this.BASE_URL}/autores/${id}`, Autores);
  }

  deleteAutores(id: string): Observable<void> {
    return this.http.delete<void>(`${this.BASE_URL}/autores/${id}`);
  }
}