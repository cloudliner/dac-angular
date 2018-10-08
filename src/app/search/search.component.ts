import { Component, OnInit } from '@angular/core';
import { ElasticsearchService } from '../elasticsearch.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  hits = 0;
  searchResult: any;
  constructor(private es: ElasticsearchService) { }

  ngOnInit() {
  }

  search(keyword: string) {
      this.es.fullTextSearch('timeline', 'message', keyword).then(
        response => {
          this.hits = response.hits.total;
          this.searchResult = response.hits.hits;
          console.log(response);
        }, error => {
          console.error(error);
        }).then(() => {
          console.log('Search Completed!');
        });
    }
}
