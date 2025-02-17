/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import type {JSONValue} from 'replicache';
import type {Storage} from 'replicache-transaction';
import {putEntry, getEntry, delEntry, getEntries} from './data.js';
import type { PrismaClient } from '@prisma/client';

// Implements the Storage interface required by replicache-transaction in terms
// of our Postgres database.
export class PostgresStorage implements Storage {
  private _spaceID: string;
  private _version: number;
  private _executor: PrismaClient;

  constructor(spaceID: string, version: number, executor: PrismaClient) {
    this._spaceID = spaceID;
    this._version = version;
    this._executor = executor;
  }

  putEntry(key: string, value: JSONValue): Promise<void> {
    return putEntry(this._executor, this._spaceID, key, value, this._version);
  }

  async hasEntry(key: string): Promise<boolean> {
    const v = await this.getEntry(key);
    return v !== undefined;
  }

  getEntry(key: string): Promise<JSONValue | undefined> {
    return getEntry(this._executor, this._spaceID, key);
  }

  getEntries(fromKey: string): AsyncIterable<readonly [string, JSONValue]> {
    return getEntries(this._executor, this._spaceID, fromKey);
  }

  delEntry(key: string): Promise<void> {
    return delEntry(this._executor, this._spaceID, key, this._version);
  }
}
