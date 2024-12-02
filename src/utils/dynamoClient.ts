import AWS from 'aws-sdk';

// Set the AWS region
AWS.config.update({
  region: 'ap-northeast-2',
});

// Create the DynamoDB DocumentClient
export const dynamoClient = new AWS.DynamoDB.DocumentClient();
