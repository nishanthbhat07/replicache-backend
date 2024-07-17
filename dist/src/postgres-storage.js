import { putEntry, getEntry, delEntry, getEntries } from './data.js';
// Implements the Storage interface required by replicache-transaction in terms
// of our Postgres database.
export class PostgresStorage {
    _spaceID;
    _version;
    _executor;
    constructor(spaceID, version, executor) {
        this._spaceID = spaceID;
        this._version = version;
        this._executor = executor;
    }
    putEntry(key, value) {
        return putEntry(this._executor, this._spaceID, key, value, this._version);
    }
    async hasEntry(key) {
        const v = await this.getEntry(key);
        return v !== undefined;
    }
    getEntry(key) {
        return getEntry(this._executor, this._spaceID, key);
    }
    getEntries(fromKey) {
        return getEntries(this._executor, this._spaceID, fromKey);
    }
    delEntry(key) {
        return delEntry(this._executor, this._spaceID, key, this._version);
    }
}
