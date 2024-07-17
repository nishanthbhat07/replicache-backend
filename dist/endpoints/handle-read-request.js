import { transact } from '../src/pg';
export const handleReadRequest = async (res, next) => {
    try {
        const spaceIds = await transact(async (executor) => {
            return await executor.replicacheSpace.findMany();
        });
        res.status(200).send({ spaceIds });
    }
    catch (e) {
        next(Error("Failed to fetch spaceids", e));
    }
};
