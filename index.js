const Log = require('lil-logger').getLogger(__filename);
const memoize = require('memoizee');
const sleep = require('then-sleep');
const Promise = require('bluebird');
const { MongoClient } = require('mongodb');
const mongodbURL = process.env.MONGO_URL || 'mongodb://localhost/test';

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
      promiseLibrary: Promise,
      loggerLevel: 'error'
    });
    _db = _client.db();
    Log.debug({ msg: `DB connected: ${exports.getDBName()}` });
    isConnecting = false;
  }
  return _db;
};

exports.getClient = async function() {
  await exports.getDB();
  return _client;
};

exports.getDBName = () => _db.databaseName;

exports.getCollection = memoize(collectionName => _db.collection(collectionName));

exports.getDB().catch(e => {
  Log.error({ msg: 'Error occurred while connecting db', error: e });
  process.exit(1);
});
