FROM elasticsearch:6.8.1

RUN bin/elasticsearch-plugin install analysis-kuromoji
RUN bin/elasticsearch-plugin install analysis-icu

# COPY config/elasticsearch.yml config/

# RUN echo 'index.analysis.analyzer.default.type: custom' >> config/elasticsearch.yml
# RUN echo 'index.analysis.analyzer.default.tokenizer: kuromoji_tokenizer' >> config/elasticsearch.yml

# RUN echo 'http.port: 80' >> config/elasticsearch.yml
