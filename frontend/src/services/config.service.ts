import {Injectable} from '@angular/core';
import {PORT_API} from "../config/global.env";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public serverUrl: string;

  constructor() {
    this.serverUrl = this.determineServerUrl();
  }

  private determineServerUrl(): string {
    const protocol = window.location.protocol; // 'http:' ou 'https:'
    const host = window.location.hostname; // 'localhost', '192.168.x.x', 'votredomaine.com', etc.
    return `${protocol}//${host}:${PORT_API}/`;
  }

  get apiUrl(): string {
    return `${this.serverUrl}api/`;
  }
}
