import type { ReadTransaction } from 'replicache';
export declare type Todo = {
    id: string;
    text: string;
    completed: boolean;
    sort: number;
};
export declare type TodoUpdate = Partial<Todo> & Pick<Todo, 'id'>;
export declare function listTodos(tx: ReadTransaction): Promise<import("replicache").DeepReadonlyObject<Todo>[]>;
