import AWS from 'aws-sdk';

//ANCHOR - Set the AWS region
AWS.config.update({
  region: 'ap-northeast-2',
});

//ANCHOR - Create the DynamoDB DocumentClient
export const dynamoClient = new AWS.DynamoDB.DocumentClient();
