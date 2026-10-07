import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment'

@Injectable({ providedIn: 'root' })
export class CheckpointService {
  private readonly base = `${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/checkpoint`

  constructor(private http: HttpClient) {}

  commission(eventId: number) { return this.http.get<any>(`${this.base}/events/${eventId}/commission`) }
  settings(eventId: number) { return this.http.get<any>(`${this.base}/events/${eventId}/settings`) }
  updateSettings(eventId: number, checkpoint_enabled: boolean) { return this.http.patch<any>(`${this.base}/events/${eventId}/settings`, { checkpoint_enabled }) }
  createGroup(eventId: number, data: any) { return this.http.post<any>(`${this.base}/events/${eventId}/groups`, data) }
  updateGroup(eventId: number, id: number, data: any) { return this.http.patch<any>(`${this.base}/events/${eventId}/groups/${id}`, data) }
  removeGroup(eventId: number, id: number) { return this.http.delete(`${this.base}/events/${eventId}/groups/${id}`) }
  createParticipant(eventId: number, data: any) { return this.http.post<any>(`${this.base}/events/${eventId}/participants`, data) }
  updateParticipant(eventId: number, id: number, data: any) { return this.http.patch<any>(`${this.base}/events/${eventId}/participants/${id}`, data) }
  removeParticipant(eventId: number, id: number) { return this.http.delete(`${this.base}/events/${eventId}/participants/${id}`) }
  preview(eventId: number, file: File, mapping?: Record<string, string>) {
    const body = new FormData()
    body.append('file', file)
    if (mapping) Object.entries(mapping).forEach(([column, field]) => body.append(`mapping[${column}]`, field))
    return this.http.post<any>(`${this.base}/events/${eventId}/imports/preview`, body)
  }
  import(eventId: number, file: File, mapping?: Record<string, string>) {
    const body = new FormData()
    body.append('file', file)
    if (mapping) Object.entries(mapping).forEach(([column, field]) => body.append(`mapping[${column}]`, field))
    return this.http.post<any>(`${this.base}/events/${eventId}/imports`, body)
  }
  template(eventId: number) { return this.http.get(`${this.base}/events/${eventId}/template`, { responseType: 'blob' }) }
  competitions() { return this.http.get<any[]>(`${this.base}/competitions`) }
  exportPackage(eventId: number) { return this.http.get<any>(`${this.base}/competitions/${eventId}/export`) }
  grantMember(eventId: number, email: string) { return this.http.post<any>(`${this.base}/events/${eventId}/members`, { email }) }
  revokeMember(eventId: number, memberId: number) { return this.http.delete(`${this.base}/events/${eventId}/members/${memberId}`) }
  acceptInvite(token: string) { return this.http.post<any>(`${this.base}/invites/${token}/accept`, {}) }
  results(eventId: number) { return this.http.get<any>(`${environment.BACKEND_URL}:${environment.BACKEND_PORT}/api/events/${eventId}/checkpoint-results`) }
}
