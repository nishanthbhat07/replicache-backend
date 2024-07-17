import { ZodType } from 'zod';
import type { MutatorDefs, ReadonlyJSONValue } from 'replicache';
export declare type Error = 'SpaceNotFound';
export declare function parseIfDebug<T extends ReadonlyJSONValue>(schema: ZodType<T>, val: T): T;
export declare function push<M extends MutatorDefs>(spaceID: string, requestBody: any, mutators: M): Promise<void>;
