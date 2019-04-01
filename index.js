const Log = require('lil-logger').getLogger(__filename);
const memoize = require('memoizee');
const sleep = require('then-sleep');
const Promise = require('bluebird');
const { MongoClient, ObjectId } = require('mongodb');
const assert = require('assert');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost/test';

/**
 * Class to create native Mongo connection
 * @class Connection
 */
class Connection {
  /**
   * Creates an instance of Connection.
   * @param {String} mongoURL - MongoDB url string
   * @memberof Connection
   */
  constructor(mongoURL) {
    assert(mongoURL);
    this._mongoURL = mongoURL;
    this._client = null;
    this._db = null;
    this._isConnecting = false;

    /**
     * Returns mongo collection for the given `collectionName`
     *
     * @public
     * @param {String} collectionName - Name of collection
     * @returns {Collection} - Mongo Collection instance
     */
    this.getCollection = memoize(collectionName => {
      this.checkAndThrowDBNotConnectedError();
      return this._db.collection(collectionName);
    });
  }

  /**
   * Throw db not connected error
   * @memberof Connection
   * @private
   */
  checkAndThrowDBNotConnectedError() {
    if (!this._db) {
      throw new Error(`Not connected: ${this._mongoURL}. Call \`connect()\` method first.`);
    }
  }

  /**
   * Connects to mongodb for the provided `mongoURL` for this connection instance
   * @public
   * @returns {Promise<DB>} - Mongodb DB instance.
   * @memberof Connection
   */
  async connect() {
    if (this.isConnecting) {
      Log.debug({ msg: 'connecting to DB' });

      await sleep(2000);
    }

    if (!this._client) {
      this.isConnecting = true;
      this._client = await MongoClient.connect(
        this._mongoURL,
        {
          promiseLibrary: Promise,
          loggerLevel: 'info',
          useNewUrlParser: true
        }
      );

      this._db = this._client.db();

      this._db.on('close', () => {
        Log.debug({ msg: `DB lost connection: ${this.getDBName()}` });
      });

      this._db.on('reconnect', () => {
        Log.debug({ msg: `DB reconnected: ${this.getDBName()}` });
      });

      Log.debug({ msg: `DB connected: ${this.getDBName()}` });
      this.isConnecting = false;
    }

    return this._db;
  }

  /**
   * Returns Mongodb DB class instance of the connected db
   *
   * @public
   * @returns {DB} - Mongodb DB instance.
   * @memberof Connection
   */
  getDB() {
    this.checkAndThrowDBNotConnectedError();
    return this._db;
  }

  /**
   * Returns connected db name
   *
   * @public
   * @returns {String} - Mongodb DB name
   * @memberof Connection
   */
  getDBName() {
    this.checkAndThrowDBNotConnectedError();
    return this._db.databaseName;
  }

  /**
   * Returns `MongoClient` instance after calling `connect()` method of current `Connection` instance
   *
   * @public
   * @returns {Promise<MongoClient>} - MongoClient instance.
   * @memberof Connection
   */
  async getClient() {
    await this.connect();
    return this._client;
  }
}

/**
 * Function will create & return new `Connection` instance.
 * @param {String} mongoURL - Valid mongodb connection string
 * @returns {Connection} - Connection instance
 */
exports.newConnection = mongoURL => new Connection(mongoURL);

let _defaultConnection = null;

/**
 * Connects to mongodb instance, using `MONGO_URL` env var.
 * @returns {Promise<DB>} - Mongodb DB instance.
 */
exports.connect = () => {
  if (_defaultConnection) {
    throw new Error(`Already connected to ${_defaultConnection.getDBName()}, Try \`newConnection()\` instead.`);
  }

  _defaultConnection = new Connection(MONGO_URL);

  return _defaultConnection.connect();
};

exports.getDB = () => {
  console.log('native-mongo-util: exports.getDB() is deprecated. Use exports.connect()');
  return exports.connect();
};

/**
 * Returns `MongoClient` instance after calling `connect()` method
 * @returns {Promise<MongoClient>} - MongoClient instance.
 */
exports.getClient = () => _defaultConnection.getClient();

/**
 * Returns connected DB name.
 * @returns {String} - DB name.
 */
exports.getDBName = () => _defaultConnection.getDBName();

/**
 * Returns mongo collection for the given `collectionName`
 *
 * @param {String} collectionName - Name of collection
 * @returns {Collection} - Mongo Collection instance
 */
exports.getCollection = collectionName => _defaultConnection.getCollection(collectionName);

/**
 * Exporting mongodb `ObjectId` class.
 */
exports.ObjectId = ObjectId;
