import type { MutatorDefs } from 'replicache';
import type Express from 'express';
export declare function handleRequest<M extends MutatorDefs>(req: Express.Request, res: Express.Response, next: Express.NextFunction, mutators: M): Promise<void>;
