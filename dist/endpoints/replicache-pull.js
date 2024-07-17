import { pull } from '../src/pull.js';
export async function handlePull(req, res, next) {
    if (req.query.spaceID === undefined) {
        res.status(400).json({ error: "spaceID is required" });
        return;
    }
    const { spaceID } = req.query;
    try {
        const resp = await pull(spaceID, req.body);
        res.json(resp);
    }
    catch (e) {
        next(Error(e));
    }
}
