import { dynamoClient } from '../utils/dynamoClient';
import { Patient } from '../models/Patient';
import openSearchClient from '../utils/penSearchClient';
const TABLE_NAME = 'Patients';
// Add a patient
export const addPatient = async (patient: Patient): Promise<void> => {
  const params = {
    TableName: TABLE_NAME,
    Item: patient,
  };
  await dynamoClient.put(params).promise();
   // Index patient in OpenSearch
   const openSearchParams = {
    index: 'patients', // OpenSearch index name
    id: patient.id,    // Unique document ID
    body: patient,     // Patient data to index
  };

  await openSearchClient.index(openSearchParams);
};

// Get all patient
export const getPatients = async (): Promise<Patient[]> => {
  const params = { TableName: TABLE_NAME };
  const data = await dynamoClient.scan(params).promise();
  return data.Items as Patient[];
};

// Get a patient by id
export const getPatientById = async (id: string): Promise<Patient | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };
  const data = await dynamoClient.get(params).promise();
  return data.Item as Patient;
};

// Update a patient
export const updatePatient = async (id: string, updatedData: Partial<Patient>): Promise<Patient | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set #name = :name, #address = :address, #conditions = :conditions, #allergies = :allergies',
    ExpressionAttributeNames: {
      '#name': 'name',
      '#address': 'address',
      '#conditions': 'conditions',
      '#allergies': 'allergies',
    },
    ExpressionAttributeValues: {
      ':name': updatedData.name || '',
      ':address': updatedData.address || '',
      ':conditions': updatedData.conditions || [],
      ':allergies': updatedData.allergies || [],
    },
    ReturnValues: 'ALL_NEW',
  };

  const result = await dynamoClient.update(params).promise();
  const updatedPatient = result.Attributes as Patient;

  // Update patient data in OpenSearch
  const openSearchParams = {
    index: 'patients',
    id,
    body: updatedPatient,
  };

  await openSearchClient.index(openSearchParams);
  return result.Attributes as Patient;
};

export const deletePatient = async (id: string): Promise<void> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };
  try {
    // Delete patient from DynamoDB
    await dynamoClient.delete(params).promise();

    // Remove the patient from OpenSearch index
    await openSearchClient.delete({
      index: 'patients',
      id,               
    });
    console.log(`Successfully deleted patient with ID: ${id}`);
  } catch (error) {
    console.error(`Failed to delete patient with ID: ${id}`, error);
    throw new Error(`Error deleting patient with ID: ${id}`);
  }
};


// Search patients by address directly from DynamoDB (No OpenSearch)
export const searchPatientsByaddress = async (address: string): Promise<Patient[]> => {
  try {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'contains (#address, :address)', // Use 'contains' to find address in the 'address' array
      ExpressionAttributeNames: {
        '#address': 'address', // The field you're searching in
      },
      ExpressionAttributeValues: {
        ':address': address, // The address you're searching for
      },
    };

    // Scan the table for matching address
    const data = await dynamoClient.scan(params).promise();
    
    // Return matching patients
    return data.Items as Patient[];
  } catch (error) {
    console.error('Error searching patients in DynamoDB:', error);
    throw new Error('Search failed');
  }
};


// Search patients by condition using OpenSearch
export const searchPatientsByConditionOpenSearch = async (condition: string): Promise<Patient[]> => {
  const searchParams = {
    index: 'patients',
    body: {
      query: {
        match: {
          conditions: condition, // Match condition in patient data
        },
      },
    },
  };

  const response = await openSearchClient.search(searchParams);
  return response.body.hits.hits.map((hit: any) => hit._source); // Extract and return patient data
};
