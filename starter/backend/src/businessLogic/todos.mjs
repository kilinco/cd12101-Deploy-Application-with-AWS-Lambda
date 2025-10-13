import * as uuid from 'uuid'

import { TodoAccess } from '../dataLayer/todosAccess.mjs'

const todoAccess = new TodoAccess()

export async function getAllTodos(userId) {
  return todoAccess.getAllTodos(userId)
}

export async function createTodo(createTodoRequest, userId) {
  const itemId = uuid.v4()

  return await todoAccess.createTodo({
    todoId: itemId,
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    createdAt: new Date().toISOString(),
    done: false,
    attachmentUrl: ''
  })
}

export async function getTodo(todoId, userId) {
  return await todoAccess.getTodo(todoId,userId)
}

export async function updateTodo(todoId, userId, updateTodoRequest) {
  return await todoAccess.updateTodo(todoId, userId, updateTodoRequest)
}

export async function deleteTodo(todoId, userId) {
  return await todoAccess.deleteTodo(todoId, userId);
}
