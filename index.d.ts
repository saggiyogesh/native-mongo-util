export function newConnection(mongoURL: string, options?: MongoClientOptions): Connection;
export function connect(options?: MongoClientOptions, dbName?: string): Promise<MongoClient>;
export function close(force?: boolean): Promise<void>;
export function getClient(): Promise<MongoClient>;
export function getDBName(): string;
export function getCollection(collectionName: string): Collection;
export { ObjectId };
/**
 * Class to create native Mongo connection
 * @class Connection
 */
declare class Connection {
    /**
     * Creates an instance of Connection.
     * @param {String} mongoURL - MongoDB url string
     * @param {Object} [options] - MongoDB connection options
     * @memberof Connection
     */
    constructor(mongoURL: string, options?: any);
    _mongoURL: string;
    _client: void;
    _db: any;
    _isConnecting: boolean;
    _options: any;
    _dbName: string;
    /**
     * Returns mongo collection for the given `collectionName`
     *
     * @public
     * @param {String} collectionName - Name of collection
     * @returns {Collection} - Mongo Collection instance
     */
    public getCollection: any;
    /**
     * Throw db not connected error
     * @memberof Connection
     * @private
     */
    private checkAndThrowDBNotConnectedError;
    /**
     * Connects to mongodb for the provided `mongoURL` for this connection instance
     * @param {Object} [options] - MongoDB connection options
     * @param {String} [dbName] - Database name
     * @public
     * @returns {Promise<DB>} - Mongodb DB instance.
     * @memberof Connection
     */
    public connect(options?: any, dbName?: string): Promise<Db>;
    isConnecting: boolean;
    /**
     * Close the db and its underlying connections
     * @public
     * @param {Boolean} [force] - Force close, emitting no events
     * @returns {Promise} - Promise
     * @memberof Connection
     */
    public close(force?: boolean): Promise<any>;
    _closedCalled: boolean;
    /**
     * Returns Mongodb DB class instance of the connected db
     *
     * @public
     * @returns {DB} - Mongodb DB instance.
     * @memberof Connection
     */
    public getDB(): Db;
    /**
     * Returns connected db name
     *
     * @public
     * @returns {String} - Mongodb DB name
     * @memberof Connection
     */
    public getDBName(): string;
    /**
     * Returns `MongoClient` instance after calling `connect()` method of current `Connection` instance
     *
     * @public
     * @returns {Promise<MongoClient>} - MongoClient instance.
     * @memberof Connection
     */
    public getClient(): Promise<MongoClient>;
}
import { Collection, Db, MongoClient, MongoClientOptions } from "mongodb";
import { ObjectId } from "mongodb";
