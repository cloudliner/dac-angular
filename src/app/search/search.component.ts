import { Component, OnInit } from '@angular/core';
import { HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { SearchResponse, TimelineItem } from '../../interface/search.interface';
import { ElasticsearchService } from '../elasticsearch.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchResult: Observable<HttpEvent<SearchResponse<TimelineItem>>>;

  constructor(private es: ElasticsearchService) { }

  ngOnInit() {
  }

  search(keyword: string) {
    this.searchResult = this.es.fullTextSearch(keyword);
  }
}
