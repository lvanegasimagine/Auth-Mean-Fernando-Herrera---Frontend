import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from "rxjs/operators";
import { AuthResponse, Usuario } from '../interfaces/auth.interfaces';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl: string = environment.baseURL;
  private _usuario!: Usuario;

  // Signo de Admiracion es para decirle al typescript que viene esa informacion

  get usuario(){
    return {...this._usuario};
  }
  constructor(private http: HttpClient) { }

  login(email: string, password: string){

    const url = `${this.baseUrl}/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>(url, body).pipe(
      tap(resp => {
        if(resp.ok){
          localStorage.setItem('token', resp.token!);
          this._usuario = {
            name: resp.name!,
            uid: resp.uid!
          }
          console.log(this._usuario);
        }
      }),
      map(resp => resp.ok),
      catchError(err => of(err.error.msg)) // captura el error y convierte el false en un observable
    );
  }

  validarToken(){
    const url = `${this.baseUrl}/auth/renew`;

    const headers = new HttpHeaders().set('x-token', localStorage.getItem('token') || '');
    return this.http.get(url, { headers });
  }
}
