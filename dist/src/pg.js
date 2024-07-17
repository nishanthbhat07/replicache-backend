// Low-level config and utilities for Postgres.
// const pool = getPool();
import { PrismaClient, Prisma } from '@prisma/client';
// /**
//  * Invokes a supplied function within a transaction.
//  * @param body Function to invoke. If this throws, the transaction will be rolled
//  * back. The thrown error will be re-thrown.
//  */
// export async function transact<R>(body: TransactionBodyFn<R>) {
//   return await withExecutor(async executor => {
//     return await transactWithExecutor(executor, body);
//   });
// }
// async function transactWithExecutor<R>(
//   executor: Executor,
//   body: TransactionBodyFn<R>,
// ) {
//   for (let i = 0; i < 10; i++) {
//     try {
//       await executor('begin');
//       try {
//         const r = await body(executor);
//         await executor('commit');
//         return r;
//       } catch (e) {
//         console.log('caught error', e, 'rolling back');
//         await executor('rollback');
//         throw e;
//       }
//     } catch (e) {
//       if (shouldRetryTransaction(e)) {
//         console.log(
//           `Retrying transaction due to error ${e} - attempt number ${i}`,
//         );
//         continue;
//       }
//       throw e;
//     }
//   }
//   throw new Error('Tried to execute transacation too many times. Giving up.');
// }
// //stackoverflow.com/questions/60339223/node-js-transaction-coflicts-in-postgresql-optimistic-concurrency-control-and
// function shouldRetryTransaction(err: unknown) {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const code = typeof err === 'object' ? String((err as any).code) : null;
//   return code === '40001' || code === '40P01';
// }
// pg.js
const prisma = new PrismaClient();
// Function to initialize database if necessary
export async function createDatabase() {
    // Implement your database creation logic using Prisma if needed
}
// Function to get database configuration
export function getDBConfig() {
    // Return your database configuration
    return {
    // Your DB config properties
    };
}
// Function to execute with Prisma Client
export async function withExecutor(f) {
    return await f(prisma);
}
// Function to handle transactions using Prisma Client
export async function transact(body) {
    return await withExecutor(async (prisma) => {
        return await transactWithExecutor(prisma, body);
    });
}
// Function to handle transactions using Prisma Client
async function transactWithExecutor(prisma, body) {
    for (let i = 0; i < 10; i++) {
        try {
            return await prisma.$transaction(async (prisma) => {
                return await body(prisma);
            }, {
                maxWait: 5000,
                timeout: 10000,
                isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            });
        }
        catch (e) {
            if (shouldRetryTransaction(e)) {
                console.log(`Retrying transaction due to error ${e} - attempt number ${i}`);
                continue;
            }
            throw e;
        }
    }
    throw new Error('Tried to execute transaction too many times. Giving up.');
}
// Function to determine if transaction should be retried
function shouldRetryTransaction(err) {
    const { code } = err;
    return code === '40001' || code === '40P01';
}
