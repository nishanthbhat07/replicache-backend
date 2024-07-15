/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import type {JSONValue} from 'replicache';
import {z} from 'zod';
import type { PrismaClient } from '@prisma/client';

export async function getEntry(
  executor: PrismaClient,
  spaceid: string,
  key: string,
): Promise<JSONValue | undefined> {
  const entry = await executor.replicacheEntry.findFirst({
    where: {
      spaceID:spaceid,
      key,
      deleted: false,
    },
    select: {
      value: true,
    },
  });
  return JSON.parse(entry?.value || "{}");
}

interface IValue{
  title:string;
  id?: number|string,
  completed?: boolean
  deleted?:boolean
}

export async function putEntry(
  executor: PrismaClient,
  spaceID: string,
  key: string,
  value: JSONValue,
  version: number,
): Promise<void> {
  console.log("value",value, key)
  const data=value as unknown as IValue;

  const {id}= await executor.todo.upsert({
    where:{
      id: Number(key.split("/")[1]) || 1
    },
    update:{
      completed: data?.completed,
      deleted: data?.deleted
    },
    create:{
      title: data?.title ,
    }
  })
  await Promise.all([
    executor.replicacheEntry.upsert({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      where: { spaceID_key: { spaceID, key } }, // Composite unique key defined in the Prisma schema
      create: {
        spaceID,
        key: `todo/${id}`,
        value: JSON.stringify({...value as Record<string,never>, id}),
        deleted: false,
        version,
        lastModified: new Date(),
      },
      update: {
        value:JSON.stringify(value),
        deleted: false,
        version,
        lastModified: new Date(),
      },
    })
  ])
}

export async function delEntry(
  executor: PrismaClient,
  spaceID: string,
  key: string,
  version: number,
): Promise<void> {
  console.log("Line45", JSON.stringify(key,null,2))
  await Promise.all([
    executor.todo.update({
      where:{id: Number(key.split("/")[1])},
      data:{
        deleted:true
      }
    }),
    executor.replicacheEntry.updateMany({
      where: {
        spaceID,
        key,
      },
      data: {
        deleted: true,
        version,
        lastModified: new Date(), // Optionally update lastModified timestamp
      },
    })
  ])

}

export async function* getEntries(
  executor: PrismaClient,
  spaceID: string,
  fromKey: string,
): AsyncIterable<readonly [string, JSONValue]> {
  const entries = await executor.replicacheEntry.findMany({
    where: {
      spaceID,
      key: {
        gte: fromKey,
      },
      deleted: false,
    },
    orderBy: {
      key: 'asc',
    },
    select: {
      key: true,
      value: true,
    },
  });
  // return entries;

  for (const row of entries) {
    yield [row.key as string, JSON.parse(row.value) as JSONValue] as const;
  }
}

export async function getChangedEntries(
  executor: PrismaClient,
  spaceID: string,
  prevVersion: number,
): Promise<[key: string, value: JSONValue, deleted: boolean][]> {
// ): Promise<[key: string, value: JSONValue, deleted: boolean][]> {
  // const result= await executor.todo.findMany();
  const entries = await executor.replicacheEntry.findMany({
    where: {
      spaceID,
      version: {
        gt: prevVersion,
      },
    },
    select: {
      key: true,
      value: true,
      deleted: true,
    },
  });
  console.log("result", entries)
  return entries.map(row => [row.key, JSON.parse(row.value), row.deleted]);
}

export async function createSpace(
  executor: PrismaClient,
  spaceID: string,
): Promise<void> {
  console.log('creating space', spaceID);
  await executor.replicacheSpace.upsert({
    where: { id: spaceID },
    update:{
      lastModified: new Date(),
    },
    create: {
      id: spaceID,
      version: 0,
      lastModified: new Date(),
    },
  });
  
}

export async function getCookie(
  executor: PrismaClient,
  spaceID: string,
): Promise<number | undefined> {
  const replicacheSpace = await executor.replicacheSpace.findUnique({
    where: {
      id: spaceID,
    },
    select: {
      version: true,
    },
  });
  // return replicacheSpace?.version;
  const value = replicacheSpace?.version ?? 1;
  if (value === undefined) {
    return undefined;
  }
  return z.number().parse(value);
}

export async function setCookie(
  executor: PrismaClient,
  spaceID: string,
  version: number,
): Promise<void> {
  await executor.replicacheSpace.update({
    where: {
      id: spaceID,
    },
    data: {
      version,
      lastModified: new Date(),  // Set lastModified to the current date and time
    },
  });
}

export async function getLastMutationID(
  executor: PrismaClient,
  clientID: string,
): Promise<number | undefined> {
  const client = await executor.replicacheClient.findUnique({
    where: {
      id: clientID,
    },
    select: {
      lastMutationID: true,
    },
  });
  const value = client?.lastMutationID ?? 0;
  if (value === undefined) {
    return undefined;
  }
  return z.number().parse(value);
}

export async function getLastMutationIDs(
  executor: PrismaClient,
  clientIDs: string[],
) {
  return Object.fromEntries(
    await Promise.all(
      clientIDs.map(async cid => {
        const lmid = await getLastMutationID(executor, cid);
        return [cid, lmid ?? 0] as const;
      }),
    ),
  );
}

export async function getLastMutationIDsSince(
  executor: PrismaClient,
  clientGroupID: string,
  sinceVersion: number,
) {
  const clients = await executor.replicacheClient.findMany({
    where: {
      clientGroupID,
      version: {
        gt: sinceVersion,
      },
    },
    select: {
      id: true,
      lastMutationID: true,
    },
  });

  return Object.fromEntries(
    clients.map(r => [r.id as string, r.lastMutationID as number] as const),
  );
}

export async function setLastMutationID(
  executor: PrismaClient,
  clientID: string,
  clientGroupID: string,
  lastMutationID: number,
  version: number,
): Promise<void> {
  await executor.replicacheClient.upsert({
    where: { id: clientID },
    update: {
      lastMutationID,
      version,
      lastModified: new Date(), // now()
    },
    create: {
      id: clientID,
      clientGroupID,
      lastMutationID,
      version,
      lastModified: new Date(), // now()
    },
  });

}

export async function setLastMutationIDs(
  executor: PrismaClient,
  clientGroupID: string,
  lmids: Record<string, number>,
  version: number,
) {
  return await Promise.all(
    [...Object.entries(lmids)].map(([clientID, lmid]) =>
      setLastMutationID(executor, clientID, clientGroupID, lmid, version),
    ),
  );
}
