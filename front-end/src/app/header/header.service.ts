import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(private http: HttpClient) {}

  // Call logout from API to erase jwt cookie
  logout() {
    return this.http.post('http://localhost:3000/auth/logout', {})
  }
}
