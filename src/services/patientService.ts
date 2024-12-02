import { dynamoClient } from '../utils/dynamoClient';
import { Patient } from '../models/Patient';


const TABLE_NAME = 'Patients';
// Add a patient
export const addPatient = async (patient: Patient): Promise<void> => {
  const params = {
    TableName: TABLE_NAME,
    Item: patient,
  };
  await dynamoClient.put(params).promise();
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
  return result.Attributes as Patient;
};

export const deletePatient = async (id: string): Promise<void> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };
  await dynamoClient.delete(params).promise();
};


// Search patients by condition directly from DynamoDB (No OpenSearch)
export const searchPatientsByCondition = async (condition: string): Promise<Patient[]> => {
  try {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'contains (#conditions, :condition)', // Use 'contains' to find condition in the 'conditions' array
      ExpressionAttributeNames: {
        '#conditions': 'conditions', // The field you're searching in
      },
      ExpressionAttributeValues: {
        ':condition': condition, // The condition you're searching for
      },
    };

    // Scan the table for matching conditions
    const data = await dynamoClient.scan(params).promise();

    // Return matching patients
    return data.Items as Patient[];
  } catch (error) {
    console.error('Error searching patients in DynamoDB:', error);
    throw new Error('Search failed');
  }
};