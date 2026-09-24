import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class CategorySuggestionService {
  constructor(private http: HttpClient) {}

  createSuggestion(payload: { name: string; description: string }): Observable<{
    status: string
    suggestion: any
  }> {
    return this.http.post<{ status: string; suggestion: any }>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/category-suggestions`,
      payload,
    )
  }
}
