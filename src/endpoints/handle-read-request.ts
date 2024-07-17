import type Express from 'express';
import { transact } from '../pg.js';

export const handleReadRequest=async (
    res: Express.Response,
    next: Express.NextFunction)=>{
        try {
           const spaceIds = await transact(async (executor) => {
             return await executor.replicacheSpace.findMany()
            });
            res.status(200).send({ spaceIds });
          } catch (e: any) {
            next(Error("Failed to fetch spaceids", e));
          }
}