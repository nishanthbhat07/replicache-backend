import type { Pool } from 'pg';
import type { Executor } from '../pg.js';
export interface PGConfig {
    initPool(): Pool;
    getSchemaVersion(executor: Executor): Promise<number>;
}
export declare function getDBConfig(): PGConfig;
