import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: any = null;

  constructor(private http: HttpClient) {}

  public loadConfig(): Promise<any> {
    return firstValueFrom(this.http.get(environment.configFile))
      .then(config => {
        this.config = config;
      })
      .catch(err => {
        console.error('Error loading config file', err);
      });
  }

  public get apiUrl(): string {
    return this.config?.apiUrl || '';
  }
}
