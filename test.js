import test from 'ava';
const { getDB, getDBName, getCollection } = require('./');

test('check connection with mongodb', async t => {
  await getDB();
  const dbName = getDBName();

  t.is(dbName, 'test');
});
