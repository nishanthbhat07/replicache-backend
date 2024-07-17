// This file defines our Todo domain type in TypeScript, and a related helper
// function to get all Todos. You'd typically have one of these files for each
// domain object in your application.
export async function listTodos(tx) {
    return await tx.scan({ prefix: 'todo/' }).values().toArray();
}
