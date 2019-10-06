import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Link, HistoryLink, CreateLink } from '../interfaces/bitly.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShortenerService {
  private path = `https://0m878txvc2.execute-api.ap-southeast-1.amazonaws.com/dev/`;
  private headers = {
    'Content-Type': 'application/json'
  };

  constructor(private http: HttpClient) {}

  shorten(long: string, custom?: string): Observable<Link> {
    const payload: CreateLink = {
      long,
    };
    if (custom) {
      payload.custom = custom;
    }
    return this.http.post<Link>(`${this.path}/shorten`, payload, {
      headers: this.headers
    });
  }

  getStats(short: string): Observable<Link> {
    return this.http.get<Link>(`${this.path}/stats/${short}`, {
      headers: this.headers,
    });
  }

  getHistory(): HistoryLink[] {
    return JSON.parse(localStorage.getItem('links')) || [];
  }

  addToHistory(links: HistoryLink[]): void {
    localStorage.setItem('links', JSON.stringify(links.slice(0, 5)));
  }
}
