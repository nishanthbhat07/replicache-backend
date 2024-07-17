import { z } from "zod";
import type Express from "express";
export declare const createIssueSchema: z.ZodObject<{
    title: z.ZodString;
    body: z.ZodString;
    assignees: z.ZodArray<z.ZodString, "many">;
    labels: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    body: string;
    title: string;
    labels: string[];
    assignees: string[];
}, {
    body: string;
    title: string;
    labels: string[];
    assignees: string[];
}>;
export declare const createIssue: ({ title, labels }: {
    title: string;
    labels: string[];
}) => Promise<{
    response: any;
    issueNumber: any;
    github_node_id: any;
}>;
export declare const updateIssue: ({ title, issueNumber, state }: {
    title: string;
    issueNumber: string;
    state: "open" | "closed" | undefined;
}) => Promise<{
    response: any;
    issueNumber: any;
    github_node_id: any;
}>;
export declare const deleteIssue: ({ node_id }: {
    node_id: string | null | undefined;
}) => Promise<{
    response: any;
}>;
export declare const handleSyncIusses: (req: Express.Request, res: Express.Response) => Promise<Express.Response<any, Record<string, any>>>;
