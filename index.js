const Log = require('logger3000').getLogger(__filename);
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
   * @param {Object} [options] - MongoDB connection options
   * @memberof Connection
   */
  constructor(mongoURL, options) {
    assert(mongoURL);
    this._mongoURL = mongoURL;
    this._client = null;
    this._db = null;
    this._isConnecting = false;
    this._options = options;

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
      const fixOpts = {
        promiseLibrary: Promise,
        loggerLevel: 'info',
        useNewUrlParser: true
      };

      this.isConnecting = true;
      this._client = await MongoClient.connect(this._mongoURL, {
        ...this._options,
        ...fixOpts
      });

      this._db = this._client.db();

      this._db.on('close', () => {
        if (this._closedCalled) {
          Log.debug({ msg: 'DB connection closed.' });
        } else {
          Log.debug({ msg: `DB lost connection: ${this.getDBName()}. Killing the process.` });
          process.exit(1);
        }
      });

      this._db.on('reconnect', () => {
        Log.debug({ msg: `DB reconnected: ${this.getDBName()}. Killing the process.` });
        process.exit(1);
      });

      Log.debug({ msg: `DB connected: ${this.getDBName()}` });
      this.isConnecting = false;
    }

    return this._db;
  }

  /**
   * Close the db and its underlying connections
   * @public
   * @param {Boolean} [force] - Force close, emitting no events
   * @returns {Promise} - Promise
   * @memberof Connection
   */
  close(force) {
    this._closedCalled = true;
    return this._client.close(force);
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
 * @param {Object} [options] - MongoDB connection options
 * @returns {Connection} - Connection instance
 */
exports.newConnection = (mongoURL, options) => new Connection(mongoURL, options);

let _defaultConnection = null;

/**
 * Connects to mongodb instance, using `MONGO_URL` env var.
 * @param {Object} [options] - MongoDB connection options
 * @returns {Promise<DB>} - Mongodb DB instance.
 */
exports.connect = options => {
  if (_defaultConnection) {
    throw new Error(`Already connected to ${_defaultConnection.getDBName()}, Try \`newConnection()\` instead.`);
  }

  _defaultConnection = new Connection(MONGO_URL, options);

  return _defaultConnection.connect();
};

/**
 * Close the db and its underlying connections
 * @public
 * @param {Boolean} [force] - Force close, emitting no events
 * @returns {Promise} - Promise
 */
exports.close = async force => {
  const result = await _defaultConnection.close(force);

  // eslint-disable-next-line require-atomic-updates
  _defaultConnection = null;
  return result;
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
