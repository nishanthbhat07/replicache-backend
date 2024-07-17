import type { WriteTransaction } from 'replicache';
import { Todo, TodoUpdate } from './todo';
export declare type M = typeof mutators;
export declare const mutators: {
    updateTodo: (tx: WriteTransaction, update: TodoUpdate) => Promise<void>;
    deleteTodo: (tx: WriteTransaction, id: {
        id: string;
    }) => Promise<void>;
    createTodo: (tx: WriteTransaction, todo: Omit<Todo, 'sort'>) => Promise<void>;
};
