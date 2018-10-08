import { Injectable } from '@angular/core';
import * as elasticsearch from 'elasticsearch-browser';

@Injectable({
  providedIn: 'root'
})
export class ElasticsearchService {
  private client: elasticsearch.Client;

  constructor() {
    this.client = new elasticsearch.Client({
      host: 'https://us-central1-dac-angular-d2bbd.cloudfunctions.net/elastic',
      log: 'trace'
    });
  }

  fullTextSearch(index, field, queryText): any {
    return this.client.search({
      index: index,
      // type: 'text',
      // filterPath: ['hits.hits._source', 'hits.total', '_scroll_id'],
      body: {
        'query': {
          'bool': {
            'must': [{
              'query_string': {
                'default_field': field,
                'query': queryText
              }
            }]
          }
        }
      },
      '_source': ['index', 'message']
    });
  }
}
