import type { ClientID, PatchOperation } from 'replicache';
import type Express from 'express';
export declare type PullResponse = {
    cookie: number;
    lastMutationIDChanges: Record<ClientID, number>;
    patch: PatchOperation[];
};
export declare function pull(spaceID: string, requestBody: Express.Request): Promise<PullResponse>;
