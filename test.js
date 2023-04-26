process.env.MONGO_URL = 'mongodb://localhost/testDB';
process.env.NODE_ENV = 'production';

const test = require('ava');

const { getDBName, connect, getCollection, newConnection, getClient } = require('./');
const opts = { minPoolSize: 20 };
test.serial('check connection with mongodb', async (t) => {
  await connect(opts);
  const client = await getClient();

  t.is(opts.minPoolSize, client.s.options.minPoolSize);
});

test.serial('fetch all records from a collection', async (t) => {
  const d = Date.now();
  await getCollection('testCol').insertOne({ d });
  const a = await getCollection('testCol').findOne({ d });
  t.truthy(a, 'Doc not saved');
});

test.serial('another mongo connection', async (t) => {
  const mongoURL = 'mongodb://localhost/someDB';
  const connection = newConnection(mongoURL, opts);
  await connection.connect();

  const d = Date.now();
  await connection.getCollection('someCol').insertOne({ d });
  const a = await connection.getCollection('someCol').findOne({ d });
  t.truthy(a, 'Doc not saved');
});

test.serial('validate options passed to mongo client for default connection', async (t) => {
  const client = await getClient();
  t.is(opts.minPoolSize, client.s.options.minPoolSize);
});

test.serial('validate options passed to mongo client for other connection', async (t) => {
  const client = await getClient();
  t.is(opts.minPoolSize, client.s.options.minPoolSize);
});
