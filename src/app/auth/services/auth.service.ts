import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { catchError, map, tap } from "rxjs/operators";
import { AuthResponse, Usuario } from '../interfaces/auth.interfaces';
import { of, Observable } from 'rxjs';

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

  registro(name: string, email: string, password: string){
    const url = `${this.baseUrl}/auth/new`;
    const body = {name, email, password};

    return this.http.post<AuthResponse>(url, body).pipe(
      tap(({ok, token}) => {
        if(ok){
          localStorage.setItem('token', token!);
        }
      }),
      map(resp => resp.ok),
      catchError(err => of(err.error.msg))
    )
  }

  login(email: string, password: string){

    const url = `${this.baseUrl}/auth`;
    const body = { email, password };

    return this.http.post<AuthResponse>(url, body).pipe(
      tap(resp => {
        if(resp.ok){
          localStorage.setItem('token', resp.token!);
          // this._usuario = { opcional
          //   name: resp.name!,
          //   uid: resp.uid!,
          //   email: resp.email!
          // }
        }
      }),
      map(resp => resp.ok),
      catchError(err => of(err.errors)) // captura el error y convierte el false en un observable
    );
  }

  validarToken(): Observable<boolean>{
    const url = `${this.baseUrl}/auth/renew`;

    const headers = new HttpHeaders().set('x-token', localStorage.getItem('token') || '');
    return this.http.get<AuthResponse>(url, { headers })
    .pipe(map(resp => {
      localStorage.setItem('token', resp.token!);
          this._usuario = {
            name: resp.name!,
            uid: resp.uid!,
            email: resp.email!
          }
      return resp.ok;
    }),catchError(err => of(false)));
  }

  logout(){
    // localStorage.clear(); TODO: limpia todo el localstorage
    localStorage.removeItem('token');
  }
}
