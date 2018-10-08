import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import * as request from 'request-promise';

exports.indexTimelineToElastic = functions.firestore
  .document('/timeline/{itemId}')
	.onWrite((change, context) => {
		const itemData = change.after.data();
		const itemId   = context.params.itemId;

		console.log('Indexing timeline item ', itemId, itemData);

		const elasticSearchFields = ['message'];
		const elasticSearchConfig = functions.config().elasticsearch;
		const elasticSearchUrl = elasticSearchConfig.url + 'timeline/item/' + itemId;
		const elasticSearchMethod = itemData ? 'POST' : 'DELETE';

		const elasticSearchRequest = {
			method: elasticSearchMethod,
			uri: elasticSearchUrl,
			auth: {
				username: elasticSearchConfig.username,
				password: elasticSearchConfig.password,
			},
			body: _.pick(itemData, elasticSearchFields),
			json: true
		};

		return request(elasticSearchRequest).then(response => {
			console.log('Elasticsearch response', response);
		})

  });

exports.searchTimelineElastic = functions.https.onRequest((req, res) => {
  const keyword = req.query.keyword;

  // const elasticSearchFields = ['message'];
  const elasticSearchConfig = functions.config().elasticsearch;
  const elasticSearchUrl = elasticSearchConfig.url + 'timeline/_search';
  const elasticSearchMethod = 'POST';

  const elasticSearchRequest = {
    method: elasticSearchMethod,
    uri: elasticSearchUrl,
    auth: {
      username: elasticSearchConfig.username,
      password: elasticSearchConfig.password,
    },
    body: { query: { bool: { must: [{ term: { 'message' : keyword } }], must_not: [], should: [] }}, from: 0, size: 10},
    json: true
  };

  request(elasticSearchRequest).then(response => {
    console.log('ElasticSearch response', response);
    res.send(response);
  });
});