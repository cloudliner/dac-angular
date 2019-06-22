export interface SearchRequest {
  keyword: string;
}

export interface SearchBody<T> {
  query: {
    match: T
  };
}

export interface SearchResponse<T> {
  hits: {
    total: number;
    hits: Array<{
      _id: string;
      _score: number;
      _source: T;
    }>
  };
}

export interface TimelineItem {
  message: string;
}
