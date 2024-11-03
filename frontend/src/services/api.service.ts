import {Injectable} from '@angular/core';
import {HttpClient, HttpParams, HttpHeaders} from '@angular/common/http';
import {ConfigService} from './config.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl: string;

  constructor(private http: HttpClient, private configService: ConfigService) {
    this.apiUrl = this.configService.apiUrl;
  }

  /**
   * Effectue une requête GET.
   * @param endpoint L'endpoint de l'API (ex: 'messages').
   * @param params Les paramètres de requête optionnels.
   * @param headers Les en-têtes de requête optionnels.
   * @returns Observable de type T.
   */
  get<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {params, headers});
  }

  /**
   * Effectue une requête POST.
   * @param endpoint L'endpoint de l'API (ex: 'messages').
   * @param body Le corps de la requête.
   * @param headers Les en-têtes de requête optionnels.
   * @returns Observable de type T.
   */
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, {headers});
  }

  /**
   * Effectue une requête PUT.
   * @param endpoint L'endpoint de l'API.
   * @param body Le corps de la requête.
   * @param headers Les en-têtes de requête optionnels.
   * @returns Observable de type T.
   */
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body, {headers});
  }

  /**
   * Effectue une requête DELETE.
   * @param endpoint L'endpoint de l'API.
   * @param headers Les en-têtes de requête optionnels.
   * @returns Observable de type T.
   */
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {headers});
  }
}
