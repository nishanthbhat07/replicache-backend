import type { MutatorDefs } from 'replicache';
import type Express from 'express';
export declare function handlePush<M extends MutatorDefs>(req: Express.Request, res: Express.Response, next: Express.NextFunction, mutators: M): Promise<void>;
