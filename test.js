process.env.MONGO_URL = 'mongodb://localhost/testDB';
process.env.NODE_ENV = 'production';

import test from 'ava';
const { getDBName, connect, getCollection, newConnection, getClient } = require('./');
const opts = { poolSize: 20 };
test.serial('check connection with mongodb', async t => {
  await connect(opts);
  const dbName = getDBName();
  t.is(dbName, 'testDB');
  // console.log('db.options', db);
  const client = await getClient();

  t.is(opts.poolSize, client.s.options.poolSize);
});

test.serial('fetch all records from a collection', async t => {
  const d = Date.now();
  await getCollection('testCol').insert({ d });
  const a = await getCollection('testCol').findOne({ d });
  t.truthy(a, 'Doc not saved');
});

test.serial('another mongo connection', async t => {
  const mongoURL = 'mongodb://localhost/someDB';
  const connection = newConnection(mongoURL, opts);
  await connection.connect();

  const dbName = connection.getDBName();
  t.is(dbName, 'someDB');

  const d = Date.now();
  await connection.getCollection('someCol').insert({ d });
  const a = await connection.getCollection('someCol').findOne({ d });
  t.truthy(a, 'Doc not saved');
});

test.serial('validate options passed to mongo client for default connection', async t => {
  const client = await getClient();
  t.is(opts.poolSize, client.s.options.poolSize);
});

test.serial('validate options passed to mongo client for other connection', async t => {
  const client = await getClient();
  t.is(opts.poolSize, client.s.options.poolSize);
});
