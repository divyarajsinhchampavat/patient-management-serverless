import { dynamoClient } from '../utils/dynamoClient';
import { Patient } from '../models/Patient';
import openSearchClient from '../utils/penSearchClient';
const TABLE_NAME = 'Patients';
//ANCHOR - Add a patient
export const addPatient = async (patient: Patient): Promise<void> => {
  const params = {
    TableName: TABLE_NAME,
    Item: patient,
  };
  await dynamoClient.put(params).promise();
   //ANCHOR -  Index patient in OpenSearch
   const openSearchParams = {
    index: 'patients', // OpenSearch index name
    id: patient.id,    // Unique document ID
    body: patient,     // Patient data to index
  };

  await openSearchClient.index(openSearchParams);
};

//ANCHOR - Get all patient
export const getPatients = async (): Promise<Patient[]> => {
  const params = { TableName: TABLE_NAME };
  const data = await dynamoClient.scan(params).promise();
  return data.Items as Patient[];
};

//ANCHOR - Get a patient by id
export const getPatientById = async (id: string): Promise<Patient | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: { id },
  };
  const data = await dynamoClient.get(params).promise();
  return data.Item as Patient;
};

//ANCHOR - Update a patient
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

  //ANCHOR - Update patient data in OpenSearch
  const openSearchParams = {
    index: 'patients',
    id,
    body: updatedPatient,
  };

  await openSearchClient.index(openSearchParams);
  return result.Attributes as Patient;
};

//ANCHOR - Delete a patient
export const deletePatient = async (id: string): Promise<{ message: string }> => {
  try {
    //ANCHOR - Check if the patient exists in DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };
    const patient = await dynamoClient.get(params).promise();

    if (!patient.Item) {
      return { message: `Patient with ID: ${id} not found in DynamoDB` };
    }

    //ANCHOR - Delete patient from DynamoDB
    await dynamoClient.delete(params).promise();

    //ANCHOR - Attempt to delete from OpenSearch, but handle case where it doesn't exist
    try {
      const osResponse = await openSearchClient.delete({
        index: 'patients',
        id,
      });

      if (osResponse.body.result === 'not_found') {
        console.warn(`Patient with ID: ${id} not found in OpenSearch`);
      }
    } catch (osError) {
      console.error(`Error deleting patient from OpenSearch: ${osError}`);
    }
    return { message: `Successfully deleted patient with ID: ${id}` }as any;
  } catch (error) {
    console.error(`Failed to delete patient with ID: ${id}`, error);
    throw new Error(`Error deleting patient with ID: ${id}`);
  }
};

//ANCHOR - Search patients by address directly from DynamoDB (No OpenSearch)
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

    //ANCHOR - Scan the table for matching address
    const data = await dynamoClient.scan(params).promise();
    
    //ANCHOR - Return matching patients
    return data.Items as Patient[];
  } catch (error) {
    console.error('Error searching patients in DynamoDB:', error);
    throw new Error('Search failed');
  }
};


//ANCHOR - Search patients by condition using OpenSearch
export const searchPatientsByConditionOpenSearch = async (condition: string): Promise<Patient[]> => {
  const searchParams = {
    index: 'patients',
    body: {
      query: {
        match: {
          conditions: condition, //ANCHOR - Match condition in patient data
        },
      },
    },
  };

  const response = await openSearchClient.search(searchParams);
  return response.body.hits.hits.map((hit: any) => hit._source); //ANCHOR - Extract and return patient data
};
