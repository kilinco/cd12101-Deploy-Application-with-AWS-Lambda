import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('dataLayer')

export class TodoAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
  }

  async getAllTodos() {
    logger.info('Getting all todos')

    const result = await this.dynamoDbClient.scan({
      TableName: this.todosTable
    })
    return result.Items
  }

  async createTodo(todo) {
    logger.info(`Creating a todo with id ${todo.id}`)
    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })
    return todo
  }
  
  async getTodo(todoId, userId){
    logger.info(`Retrieving todo with id ${todoId}`)
    const result = await this.dynamoDbClient.get({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })
    return result;
  }


  async updateTodo(todoId, userId, updatedTodo) {
    logger.info(`Updating todo with id ${todoId} for user ${userId}`)

    await this.dynamoDbClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {
        '#name': 'name' // reserved word
      },
      ExpressionAttributeValues: {
        ":name": updatedTodo.name,
        ":dueDate": updatedTodo.dueDate,
        ":done": updatedTodo.done
      },
      ReturnValues: "NONE"
    })
    return
  }

  async deleteTodo(todoId, userId) {
    logger.info(`Deleting todo with id ${todoId} for user ${userId}`)

    await this.dynamoDbClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })
    return
  }
}
