import { push } from '../src/push.js';
export async function handlePush(req, res, next, mutators) {
    if (req.query.spaceID === undefined) {
        res.status(400).send('Missing spaceID');
        return;
    }
    const spaceID = req.query.spaceID.toString();
    try {
        await push(spaceID, req.body, mutators);
        res.status(200).json({});
    }
    catch (e) {
        next(Error(e));
    }
}
