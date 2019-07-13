import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as corsLib from 'cors';

import { Client, RequestParams, ApiResponse } from '@elastic/elasticsearch';
import { SearchBody, SearchResponse, TimelineItem } from '../../src/interface/search.interface'

const cors = corsLib();
const elasticConfig = functions.config().elasticsearch;
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const getElasticClient = (): Client => {
	/*
	  firebase functions:config:set \
  		elasticsearch.username="user" \
  		elasticsearch.password="password" \
  		elasticsearch.host="example.com" \
  		elasticsearch.port="80" \
  		elasticsearch.path="elasticsearch"
	*/
	let url = 'http://';
	if (elasticConfig.username && elasticConfig.password) {
		url += `${ elasticConfig.username }:${ elasticConfig.password }@`;
	}
	url += `${ elasticConfig.host }:${ elasticConfig.port }`;
	if (elasticConfig.path) {
		url += `/${ elasticConfig.path }`
	}
	const client = new Client({
		node: url,
		sniffOnStart: true,
	});
	return client;
}

exports.elasticCreateTimelineIndex = functions.https.onRequest(async(req, res) => {
	console.log('Create Timeline Index');
	const client = getElasticClient();
	try {
		const body =  {
			mappings: {
				item: {
					properties: {
						message: {
							type: 'text'
						}
					}
				}
			}
		}
		const createIndexParamas: RequestParams.IndicesCreate<any> = {
			index: 'timeline',
			body: body
		}
		const createIndexRes: ApiResponse<any> = await client.indices.create(createIndexParamas);
		console.log(JSON.stringify(createIndexRes));
		res.send(JSON.stringify(createIndexRes.body));
	} catch (error) {
		console.error(JSON.stringify(error));
		res.status(500).send(JSON.stringify(error.meta.body ? error.meta.body : error));
	}
});

exports.elasticDeleteTimelineIndex = functions.https.onRequest(async(req, res) => {
	console.log('Delete Timeline Index');
	const client = getElasticClient();
	try {
		const deleteIndexParams: RequestParams.IndicesDelete = {
			index: 'timeline'
		};
		const deleteIndexRes: ApiResponse<any> = await client.indices.delete(deleteIndexParams);
		console.log(JSON.stringify(deleteIndexRes));
		res.send(JSON.stringify(deleteIndexRes.body));
	} catch (error) {
		console.error(JSON.stringify(error));
		const statusCode = error && error.meta && error.meta.statusCode ? error.meta.statusCode : 500;
		res.status(statusCode).send(JSON.stringify(error.meta.body ? error.meta.body : error));
	}
});

exports.elasticBatchTimelineIndex = functions.https.onRequest(async (req, res) => {
	console.log('Batch Timeline Index');
	const snapshot = await db.collection('timeline').get();
	let successCount = 0;
	let errorCount = 0;
	const updates = snapshot.docs.map(async(doc) => {
		try {
			console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
			const client = getElasticClient();
			const createParams: RequestParams.Create<Pick<FirebaseFirestore.DocumentData, string>> = {
				index: 'timeline',
				type: 'item',
				id: doc.id,
				body: doc.data(),
			}
			const createRes: ApiResponse<any> = await client.create(createParams);
			console.log(JSON.stringify(createRes));
			successCount ++;
			return createRes.body;
		} catch (error) {
			console.error(JSON.stringify(error));
			errorCount ++;
			return error.meta.body ? error.meta.body : error;
		}
	});
	const list = await Promise.all(updates);
	const result = {
		successCount,
		errorCount,
		list,
	}
	console.log(JSON.stringify(result));
	res.send(JSON.stringify(result));
});

exports.elasticUpdateTimelineIndex = functions.firestore
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

exports.searchTimeline = functions.https.onRequest(async(req, res) => {
	cors(req, res, async() => {
		console.log(req.body);
		const client = getElasticClient();
		try {
			const keyword = req.body.keyword;
			const searchParams: RequestParams.Search<SearchBody<TimelineItem>> = {
				index: 'timeline',
				body: {
					query: {
						match: { message: keyword }
					}
				}
			}
			const searchRes: ApiResponse<SearchResponse<TimelineItem>> = await client.search(searchParams);
			console.log(JSON.stringify(searchRes.body));
			res.send(searchRes.body);
		} catch (error) {
			console.error(JSON.stringify(error));
			const statusCode = error && error.meta && error.meta.statusCode ? error.meta.statusCode : 500;
			res.status(statusCode).send(JSON.stringify(error.meta.body ? error.meta.body : error));
		}
	});
});
