import test from 'ava';
const { getDBName, connect, getCollection, newConnection } = require('./');
test.serial('check connection with mongodb', async t => {
  await connect();
  const dbName = getDBName();
  t.is(dbName, 'test');
});

test.serial('fetch all records from a collection', async t => {
  const a = await getCollection('testCol')
    .find()
    .toArray();

  t.is(a.length, 0);
});

test.serial('another mongo connection', async t => {
  const mongoURL = 'mongodb://localhost/someDB';
  const connection = newConnection(mongoURL);
  await connection.connect();

  const dbName = connection.getDBName();
  t.is(dbName, 'someDB');

  const a = await connection
    .getCollection('testCol')
    .find()
    .toArray();

  t.is(a.length, 0);
});
