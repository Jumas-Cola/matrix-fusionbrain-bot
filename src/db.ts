import { MongoClient } from 'mongodb';
import config from './config';

export default async function getCollection(dbClient: MongoClient) {
  await dbClient.connect();
  const db = dbClient.db(config.dbName);
  const collection = db.collection(config.dbCollection);
  return collection;
}
