import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { MototrackRiderRunsResponse } from 'src/app/models/mototrack-rider-run'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root',
})
export class MototrackRiderRunsService {
  constructor(private http: HttpClient) {}

  getMyRuns(): Observable<MototrackRiderRunsResponse> {
    return this.http.get<MototrackRiderRunsResponse>(
      `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/users/cabinet/mototrack-runs`,
    )
  }
}
