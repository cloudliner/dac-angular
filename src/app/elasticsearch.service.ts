import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SearchRequest, SearchResponse, TimelineItem } from '../interface/search.interface';

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {
  private host = 'https://us-central1-dac-angular-d2bbd.cloudfunctions.net';
  private httpOptions: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private client: HttpClient) {}

  fullTextSearch(queryText: string): Observable<HttpEvent<SearchResponse<TimelineItem>>> {
    const body: SearchRequest = {
      keyword: queryText
    };
    const result = this.client.post<SearchResponse<TimelineItem>>(`${ this.host }/searchTimeline`, body, this.httpOptions);
    return result;
  }
}
