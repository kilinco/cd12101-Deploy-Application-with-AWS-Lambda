import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import AWSXRay from "aws-xray-sdk-core";

export function createDynamoDbClient() {
  const isOffline = process.env.IS_OFFLINE === "true";
  const clientConfig = isOffline
    ? { endpoint: "http://localhost:8000", region: "local" }
    : { region: process.env.AWS_REGION || "us-west-2" };
  const dynamoClient = isOffline
    ? new DynamoDB(clientConfig)
    : AWSXRay.captureAWSv3Client(new DynamoDB(clientConfig));
  return DynamoDBDocument.from(dynamoClient);
}