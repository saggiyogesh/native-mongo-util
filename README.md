# native-mongo-util

Utility package to connect multiple mongo databases. Supports SSH tunneling.

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
      await connect({ poolSize: 20 }); // connect to db with options to MongoClient

      const userCollection = getCollection('user');
      const allUsers = await userCollection.find().toArray();
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
      const connection = newConnection(mongoURL, { poolSize: 20 }); // Provide mongo uri & MongoClient options
      await connection.connect(); // connect to someOtherDB

      const studentsCollection = connection.getCollection('students'); // get students collection from someOtherDB connection.

      const allUsers = await studentsCollection.find().toArray();
      console.log(allUsers);
    } catch (err) {
      console.log('Error ocurred while connecting DB', err);
      throw err;
    }
  })();
  ```

## API

- `exports.newConnection(mongoURL, options)` Function will create & return new `Connection` class instance. `mongoURL` is valid mongodb connection string. `options` is MongoClient options
- `async exports.connect(options)` Async function that connects to mongodb, using `MONGO_URL` env var. MongoClient `options` can also be passed. Returns Mongodb `DB` class instance
- `exports.getCollection(collectionName)` Returns Mongodb collection (`Collection` instance) for `collectionName`.
- `async exports.getClient()` Returns Mongodb `MongoClient` class instance
- `exports.getDBName()` Returns connected mongodb name

- Class **Connection** methods
  - `constructor(mongoURL, options)` Valid mongodb connection string and MongoClient options
  - `async connect()` Async method connects to mongodb, using `mongoURL` for the same instance. Returns Mongodb `DB` class instance
  - `getCollection(collectionName)` Returns mongodb collection.
  - `getDBName()` Returns db name
  - `async getClient()` Returns Mongodb `MongoClient` instance.

## Environment Variables

- `MONGO_URL` Mongo connection url
- `PROCESS_EXIT_ON_MONGO_ERROR` Prevent node process exit on any Mongo error. Default value is `true`.
- `SSH_HOST` ssh hostname or ip
- `SSH_USER` ssh user for remote connection
- `SSH_PASSWORD` ssh connection password
- `SSH_KEY_PATH` ssh private key path like `~/.ssh/id_rsa`. Either of `SSH_PASSWORD` or `SSH_KEY_PATH` must be provided depending on remote server auth mode.

[![Build Status](https://travis-ci.org/saggiyogesh/native-mongo-util.svg?branch=master)](https://travis-ci.org/saggiyogesh/native-mongo-util)
