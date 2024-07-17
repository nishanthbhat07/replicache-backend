import type { JSONValue } from 'replicache';
import type { Storage } from 'replicache-transaction';
import type { PrismaClient } from '@prisma/client';
export declare class PostgresStorage implements Storage {
    private _spaceID;
    private _version;
    private _executor;
    constructor(spaceID: string, version: number, executor: PrismaClient);
    putEntry(key: string, value: JSONValue): Promise<void>;
    hasEntry(key: string): Promise<boolean>;
    getEntry(key: string): Promise<JSONValue | undefined>;
    getEntries(fromKey: string): AsyncIterable<readonly [string, JSONValue]>;
    delEntry(key: string): Promise<void>;
}
