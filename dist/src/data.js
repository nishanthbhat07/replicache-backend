import { z } from 'zod';
import { createIssue, deleteIssue, updateIssue } from './github-issues';
export async function getEntry(executor, spaceid, key) {
    const entry = await executor.replicacheEntry.findFirst({
        where: {
            spaceID: spaceid,
            key,
            deleted: false,
        },
        select: {
            value: true,
        },
    });
    return JSON.parse(entry?.value || "{}");
}
export async function putEntry(executor, spaceID, key, value, version) {
    console.log("value", value, key);
    const data = value;
    const result = await executor.todo.findUnique({
        where: {
            id: Number(key.split("/")[1]) || 1
        }
    });
    console.log("Line47", result, typeof result?.id, !result?.id);
    // if(result?.deleted) return;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { issueNumber, github_node_id } = !result?.id ? await createIssue({ title: data.title, labels: ["bug"] })
        : await updateIssue({
            title: data?.title,
            issueNumber: Number(result?.githubIssueNumber).toString(),
            state: data?.completed ? "closed" : "open"
        });
    const { id } = await executor.todo.upsert({
        where: {
            id: Number(key.split("/")[1]) || 1
        },
        update: {
            title: data?.title || result?.title,
            completed: data?.completed,
            deleted: data?.deleted
        },
        create: {
            title: data?.title,
            githubIssueNumber: issueNumber,
            githubNodeId: github_node_id,
        }
    });
    await Promise.all([
        executor.replicacheEntry.upsert({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            where: { spaceID_key: { spaceID, key } },
            create: {
                spaceID,
                key: `todo/${id}`,
                value: JSON.stringify({ ...value, id }),
                deleted: false,
                version,
                lastModified: new Date(),
            },
            update: {
                value: JSON.stringify(value),
                deleted: false,
                version,
                lastModified: new Date(),
            },
        })
    ]);
}
export async function delEntry(executor, spaceID, key, version) {
    console.log("Line45", JSON.stringify(key, null, 2));
    const [result] = await Promise.all([
        executor.todo.update({
            where: { id: Number(key.split("/")[1]) },
            data: {
                deleted: true
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
    ]);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    await deleteIssue({ node_id: result?.githubNodeId });
}
export async function* getEntries(executor, spaceID, fromKey) {
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
        yield [row.key, JSON.parse(row.value)];
    }
}
export async function getChangedEntries(executor, spaceID, prevVersion) {
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
    console.log("result", entries);
    return entries.map(row => [row.key, JSON.parse(row.value), row.deleted]);
}
export async function createSpace(executor, spaceID) {
    console.log('creating space', spaceID);
    await executor.replicacheSpace.upsert({
        where: { id: spaceID },
        update: {
            lastModified: new Date(),
        },
        create: {
            id: spaceID,
            version: 0,
            lastModified: new Date(),
        },
    });
}
export async function getCookie(executor, spaceID) {
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
export async function setCookie(executor, spaceID, version) {
    await executor.replicacheSpace.update({
        where: {
            id: spaceID,
        },
        data: {
            version,
            lastModified: new Date(), // Set lastModified to the current date and time
        },
    });
}
export async function getLastMutationID(executor, clientID) {
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
export async function getLastMutationIDs(executor, clientIDs) {
    return Object.fromEntries(await Promise.all(clientIDs.map(async (cid) => {
        const lmid = await getLastMutationID(executor, cid);
        return [cid, lmid ?? 0];
    })));
}
export async function getLastMutationIDsSince(executor, clientGroupID, sinceVersion) {
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
    return Object.fromEntries(clients.map(r => [r.id, r.lastMutationID]));
}
export async function setLastMutationID(executor, clientID, clientGroupID, lastMutationID, version) {
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
export async function setLastMutationIDs(executor, clientGroupID, lmids, version) {
    return await Promise.all([...Object.entries(lmids)].map(([clientID, lmid]) => setLastMutationID(executor, clientID, clientGroupID, lmid, version)));
}
