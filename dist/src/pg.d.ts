import { PrismaClient } from '@prisma/client';
export declare type Executor = (sql: string, params?: any[]) => Promise<any>;
export declare type TransactionBodyFn<R> = (executor: PrismaClient) => Promise<R>;
export declare function createDatabase(): Promise<void>;
export declare function getDBConfig(): {};
export declare function withExecutor<R>(f: (executor: PrismaClient) => R): Promise<R>;
export declare function transact<R>(body: TransactionBodyFn<R>): Promise<R>;
