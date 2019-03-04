# native-mongo-util

Utility package to connect multiple mongo databases.

## Usage

- Connect single db by configuring mongdb url in `MONGO_URL` env var.

  ```
  export MONGO_URL=mongodb://localhost/test
  ```

  Code to connect the above db & get mongo collection instance.

  ```javascript
  const { connect, getCollection } = require('native-mongo-util');

  (async () => {
    try {
      await connect(); // connect to db

      const userCollection = getCollection('user');
      const allUsers = userCollection.find().toArray();
      console.log(allUsers);
    } catch (err) {
      console.log('Error ocurred while connecting DB', err);
      throw err;
    }
  })();
  ```

- Connecting other mongo db

  ```javascript
  const { newConnection } = require('native-mongo-util');

  (async () => {
    try {
      const mongoURL = 'mongodb://localhost/someOtherDB';
      const connection = newConnection(mongoURL);
      await connection.connect(); // connect to someOtherDB

      const studentsCollection = connection.getCollection('students'); // get students collection from someOtherDB connection.

      const allUsers = studentsCollection.find().toArray();
      console.log(allUsers);
    } catch (err) {
      console.log('Error ocurred while connecting DB', err);
      throw err;
    }
  })();
  ```

## API

- `exports.newConnection(mongoURL)` Function will create & return new `Connection` class instance. `mongoURL` is valid mongodb connection string.
- `async exports.connect()` Async function that connects to mongodb, using `MONGO_URL` env var. Returns Mongodb `DB` class instance
- `exports.getCollection(collectionName)` Returns Mongodb collection (`Collection` instance) for `collectionName`.
- `async exports.getClient()` Returns Mongodb `MongoClient` class instance
- `exports.getDBName()` Returns connected mongodb name

- Class **Connection** methods
  - `constructor(mongoURL)` Valid mongodb connection string
  - `async connect()` Async method connects to mongodb, using `mongoURL` for the same instance. Returns Mongodb `DB` class instance
  - `getCollection(collectionName)` Returns mongodb collection.
  - `getDBName()` Returns db name
  - `async getClient()` Returns Mongodb `MongoClient` instance.

https://travis-ci.org/saggiyogesh/native-mongo-util.svg?branch=master
