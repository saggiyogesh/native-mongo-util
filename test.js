process.env.MONGO_URL = 'mongodb://localhost/testDB';

import test from 'ava';
const { getDBName, connect, getCollection, newConnection } = require('./');
test.serial('check connection with mongodb', async t => {
  await connect();
  const dbName = getDBName();
  t.is(dbName, 'testDB');
});

test.serial('fetch all records from a collection', async t => {
  const d = Date.now();
  await getCollection('testCol').insert({ d });
  const a = await getCollection('testCol').findOne({ d });
  t.truthy(a, 'Doc not saved');
});

test.serial('another mongo connection', async t => {
  const mongoURL = 'mongodb://localhost/someDB';
  const connection = newConnection(mongoURL);
  await connection.connect();

  const dbName = connection.getDBName();
  t.is(dbName, 'someDB');

  const d = Date.now();
  await connection.getCollection('someCol').insert({ d });
  const a = await connection.getCollection('someCol').findOne({ d });
  t.truthy(a, 'Doc not saved');
});