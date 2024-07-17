import { nanoid } from 'nanoid';
import { transact } from '../src/pg.js';
import { getCookie, createSpace } from "../src/data.js";
export async function handleCreateSpace(req, res, next) {
    let spaceID = nanoid(6);
    if (req.body.spaceID) {
        spaceID = req.body.spaceID;
    }
    if (spaceID.length > 10) {
        next(Error(`SpaceID must be 10 characters or less`));
    }
    try {
        await transact(async (executor) => {
            await createSpace(executor, spaceID);
        });
        res.status(200).send({ spaceID });
    }
    catch (e) {
        next(Error(`Failed to create space ${spaceID}`, e));
    }
}
export async function handleSpaceExist(req, res, next) {
    try {
        const cookie = await transact(async (executor) => {
            return await getCookie(executor, req.body.spaceID);
        });
        const exists = cookie !== undefined;
        res.status(200).send({ spaceExists: exists });
    }
    catch (e) {
        next(Error(`Failed to check space exists ${req.body.spaceID}`, e));
    }
}
