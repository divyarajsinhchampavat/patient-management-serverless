# Serverless Patient Management API

## Overview
This is a serverless REST API built using Node.js, TypeScript, and AWS services like Lambda, DynamoDB, and OpenSearch. It includes full CRUD functionality for managing patient records and integrates with AWS Cognito for authentication.

## Features
- CRUD operations for patient management.
- Query patients by address and medical condition.
- Authentication using AWS Cognito.
- Full-text search using AWS OpenSearch.
- Serverless deployment with AWS Lambda and API Gateway.

## Prerequisites
- Node.js and npm installed.
- AWS CLI configured with valid credentials.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/divyarajsinhchampavat/patient-management-serverless.git
   cd patient-management-serverless
   
2. Install dependencies:
   ```bash
   npm install

2. Build the project:
   ```bash
   npm run build
   
2. Start the project locally:
   ```bash
   npm run dev
   
## Setup Instructions
### Patient CRUD
- POST /patients: Create a new patient.
- GET /patients: Retrieve all patients.
- GET /patients/:id: Retrieve a patient by ID.
- PUT /patients/:id: Update a patient.
- DELETE /patients/:id: Delete a patient.
- GET /patients/search?condition=<condition>: Search patients by condition.

#### Note - Steps to Get the Bearer Token are below

## Deployment Plan

This deployment plan outlines the steps to deploy the Serverless Patient Management API using AWS serverless technologies, including Lambda, API Gateway, DynamoDB, and OpenSearch.

### Overview
The deployment process uses the **Serverless Framework** to simplify the provisioning of AWS resources and the deployment of Lambda functions.

### Steps

#### 1. Set Up AWS Resources
- **DynamoDB**: 
  - Create a table named `Patients` with `id` as the primary key.
- **OpenSearch**:
  - Provision an OpenSearch domain for full-text search.
- **Cognito**:
  - Configure a User Pool for authentication.
  - Create an App Client for generating and validating authentication tokens.

#### 2. Configure the Serverless Framework
1. Install the Serverless Framework globally on your system:
   ```bash
   npm install -g serverless
2. Define your AWS resources and Lambda functions in the serverless.yml file in the project root.

3. Deploy the Application
      - Deploy the project to AWS using the following command:
    ```bash
      serverless deploy  
    ```  
      - After deployment, note the API Gateway endpoints provided in the deployment output.
4. Monitor and Maintain
   - Use AWS CloudWatch to monitor logs and performance metrics for your Lambda functions and API Gateway.
   - Regularly review and update IAM roles and permissions to ensure security and minimize unnecessary access.

## Steps to Get the Bearer Token

To authenticate API requests, you will need a **Bearer token** generated through **AWS Cognito**. Follow the steps below to obtain the token:

1. **Visit the Cognito Login URL**:
   Click on the following URL to access the Cognito login page:

   [Cognito Login URL](https://ap-northeast-26vqb4fuyb.auth.ap-northeast-2.amazoncognito.com/login?client_id=27rcua8ev88k3h9f2di1t3ff0d&redirect_uri=https%3A%2F%2F91ef6s7nl6.execute-api.ap-northeast-2.amazonaws.com%2F&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile)

2. **Enter the Login Credentials**:
   - The login credentials will be provided to you via email.
   
3. **Get the Access Token**:
   - After logging in, you will be redirected to a URL with an **Access Token** included in the URL fragment.
   - The URL will look like this:
     ```
     https://91ef6s7nl6.execute-api.ap-northeast-2.amazonaws.com/?access_token=<your-access-token>
     ```

4. **Use the Token in Postman**:
   - Set the **Authorization** type to **Bearer Token** in **Postman**.
   - Paste your **JWT token** in the **Token** field.
   - Make a request to a secured route like `/patients`.
   
   This token is required for making authenticated requests to the API.

---

This will allow you to use the generated Bearer token for authenticating and testing API calls in Postman.
