import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//   response.send("Hello from Firebase!");
// });

// const functions = require('firebase-functions');
import * as _ from 'lodash';
// const request = require('request-promise');

exports.indexCarsToElastic = functions.firestore
  .document('/timeline/{itemId}')
	.onWrite((change, context) => {
		const itemData = change.after.data();
		const itemId   = context.params.itemId;

		console.log('Indexing timeline item ', itemId, itemData);

		const elasticsearchFields = ['message'];
		const elasticSearchConfig = functions.config().elasticsearch;
		const elasticSearchUrl = elasticSearchConfig.url + 'timeline/item/' + itemId;
		const elasticSearchMethod = itemData ? 'POST' : 'DELETE';

		const elasticsearchRequest = {
			method: elasticSearchMethod,
			uri: elasticSearchUrl,
			auth: {
				username: elasticSearchConfig.username,
				password: elasticSearchConfig.password,
			},
			body: _.pick(itemData, elasticsearchFields),
			json: true
		};

		return request(elasticsearchRequest).then(response => {
			console.log('Elasticsearch response', response);
		})

	});