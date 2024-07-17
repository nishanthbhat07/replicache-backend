import { PGMemConfig } from './pgmem.js';
import { PostgresDBConfig } from './postgres.js';
export function getDBConfig() {
    const dbURL = process.env.DATABASE_URL;
    if (dbURL) {
        return new PostgresDBConfig(dbURL);
    }
    return new PGMemConfig();
}
