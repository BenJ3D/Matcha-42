import { Injectable } from '@angular/core';
import { PORT_API } from "../config/global.env";

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  public serverUrl: string;

  constructor() {
    this.serverUrl = this.determineServerUrl();
  }

  private determineServerUrl(): string {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    return `${protocol}//${host}:${PORT_API}/`;
  }

  get apiUrl(): string {
    return `${this.serverUrl}api/`;
  }
}
