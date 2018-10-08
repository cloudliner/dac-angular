import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import * as request from 'request-promise';
import * as express from 'express';
import * as cors from 'cors';

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

const app = express();
app.use(cors({ origin: true }));
app.post('/timeline/_search', (req, res) => {
  const elasticSearchConfig = functions.config().elasticsearch;
  const elasticSearchMethod = 'POST';
  const elasticSearchUrl = elasticSearchConfig.url + 'timeline/_search';

  console.log('ElasticSearch request: ' + req.body);
  const elasticSearchRequest = {
    method: elasticSearchMethod,
    uri: elasticSearchUrl,
    auth: {
      username: elasticSearchConfig.username,
      password: elasticSearchConfig.password,
    },
    body: req.body,
    json: true
  };

  request(elasticSearchRequest).then(response => {
    console.log('ElasticSearch response: ', response);
    res.send(response);
  });
});

exports.elastic = functions.https.onRequest(app);
