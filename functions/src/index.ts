import * as functions from 'firebase-functions';
import * as corsLib from 'cors';

import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { SearchBody, SearchResponse, TimelineItem } from '../../src/interface/search.interface'

const cors = corsLib();
const elasticConfig = functions.config().elasticsearch;

const getElasticClient = (): Client => {
	const client = new Client({
		node: `http://${ elasticConfig.username }:${ elasticConfig.password }@${ elasticConfig.host }:${ elasticConfig.port }/${ elasticConfig.path }`,
		sniffOnStart: true,
	});
	return client;
}

exports.indexTimelineToElastic = functions.firestore
  .document('/timeline/{itemId}')
	.onWrite(async(change, context) => {
		const newData = change.after.exists ? change.after.data() : null;
		const oldData = change.before.data();
		const itemId   = context.params.itemId;
	
		console.log(`Indexing timeline item: ${itemId}, new: ${JSON.stringify(newData)},old: ${JSON.stringify(oldData)}`);

		const client = getElasticClient();

		try {
			if (! newData) {
				// Delete
				const deleteParams: RequestParams.Delete = {
					index: 'timeline',
					type: 'item',
					id: itemId,
				}
				const deleteRes: ApiResponse<any> = await client.delete(deleteParams);
				console.log(JSON.stringify(deleteRes));
			} else if (! oldData) {
				// Create
				const createParams: RequestParams.Create<Pick<FirebaseFirestore.DocumentData, string>> = {
					index: 'timeline',
					type: 'item',
					id: itemId,
					body: newData,
				}
				const createRes: ApiResponse<any> = await client.create(createParams);
				console.log(JSON.stringify(createRes));	
			} else {
				// Update
				const updateParams: RequestParams.Update<Pick<FirebaseFirestore.DocumentData, string>> = {
					index: 'timeline',
					type: 'item',
					id: itemId,
					body: { doc: newData },
				}
				const updateRes: ApiResponse<any> = await client.update(updateParams);
				console.log(JSON.stringify(updateRes));
			}
		} catch (error) {
			console.error(JSON.stringify(error));
		}
	});

exports.searchTimeline = functions.https.onRequest((req, res) => {
	cors(req, res, () => {
		console.log(req.body);
		const keyword = req.body.keyword;
		const searchParams: RequestParams.Search<SearchBody<TimelineItem>> = {
			index: 'timeline',
			body: {
				query: {
					match: { message: keyword }
				}
			}
		}

		const client = getElasticClient();
		client.search(searchParams).then((searchRes: ApiResponse<SearchResponse<TimelineItem>>) => {
			console.log(JSON.stringify(searchRes.body));
				res.send(searchRes.body);
		}).catch((reason) => {
			console.error(JSON.stringify(reason));
		});
	});
});
