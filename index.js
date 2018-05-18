const Log = require('lil-logger').getLogger(__filename);
const memoize = require('memoizee');
const sleep = require('then-sleep');

const { MongoClient } = require('mongodb');
const mongodbURL = process.env.MONGO_URL || 'mongodb://localhost/lilprod-db';

let _client;
let _db;
let isConnecting = false;
exports.getDB = async function() {
  if (isConnecting) {
    Log.debug({ msg: 'connecting to DB' });

    await sleep(2000);
  }
  if (!_client) {
    isConnecting = true;
    await sleep(1000);
    _client = await MongoClient.connect(mongodbURL, {
      promiseLibrary: require('bluebird'),
      loggerLevel: 'error',
      reconnectInterval: 2000
    });
    _db = _client.db();
    Log.debug({ msg: `DB connected: ${_db.databaseName}` });
    isConnecting = false;
  }
  return Object.freeze(_db);
};

exports.getClient = async function() {
  await exports.getDB();
  return Object.freeze(_client);
};

exports.getCollection = memoize(collectionName => _db.collection(collectionName));

exports.getDB().catch(e => {
  Log.error({ msg: 'Error occurred while connecting db', error: e });
  process.exit(1);
});
