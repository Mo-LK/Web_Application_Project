import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    constructor(private readonly http: HttpClient) {}

    getRequest(route: string): Observable<Message> {
        return this.http.get<Message>(`${environment.serverUrlApi}/${route}`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    postRequest(route: string, message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${environment.serverUrlApi}/${route}`, message, { observe: 'response', responseType: 'text' });
    }

    deleteRequest(route: string): Observable<Message> {
        return this.http.delete<Message>(`${environment.serverUrlApi}/${route}`).pipe(catchError(this.handleError<Message>('failedDelete')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
