import type { JSONValue } from 'replicache';
import type { PrismaClient } from '@prisma/client';
export declare function getEntry(executor: PrismaClient, spaceid: string, key: string): Promise<JSONValue | undefined>;
export declare function putEntry(executor: PrismaClient, spaceID: string, key: string, value: JSONValue, version: number): Promise<void>;
export declare function delEntry(executor: PrismaClient, spaceID: string, key: string, version: number): Promise<void>;
export declare function getEntries(executor: PrismaClient, spaceID: string, fromKey: string): AsyncIterable<readonly [string, JSONValue]>;
export declare function getChangedEntries(executor: PrismaClient, spaceID: string, prevVersion: number): Promise<[key: string, value: JSONValue, deleted: boolean][]>;
export declare function createSpace(executor: PrismaClient, spaceID: string): Promise<void>;
export declare function getCookie(executor: PrismaClient, spaceID: string): Promise<number | undefined>;
export declare function setCookie(executor: PrismaClient, spaceID: string, version: number): Promise<void>;
export declare function getLastMutationID(executor: PrismaClient, clientID: string): Promise<number | undefined>;
export declare function getLastMutationIDs(executor: PrismaClient, clientIDs: string[]): Promise<{
    [k: string]: number;
}>;
export declare function getLastMutationIDsSince(executor: PrismaClient, clientGroupID: string, sinceVersion: number): Promise<{
    [k: string]: number;
}>;
export declare function setLastMutationID(executor: PrismaClient, clientID: string, clientGroupID: string, lastMutationID: number, version: number): Promise<void>;
export declare function setLastMutationIDs(executor: PrismaClient, clientGroupID: string, lmids: Record<string, number>, version: number): Promise<void[]>;
