import * as patientService from '../services/patientService';
import { dynamoClient } from '../utils/dynamoClient';
import openSearchClient from '../utils/penSearchClient';
import { Patient } from '../models/Patient';

// Mock the dependencies
jest.mock('../utils/dynamoClient', () => ({
  dynamoClient: {
    put: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}), 
      }),
      scan: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({}), 
      }),
  },
}));

jest.mock('../utils/penSearchClient', () => ({
    __esModule: true,
    default: {
      index: jest.fn().mockResolvedValue({}), // Mock OpenSearch indexing
      delete: jest.fn().mockResolvedValue({}), // Mock OpenSearch deletion
      search: jest.fn().mockResolvedValue({}), // Mock OpenSearch searching
    },
  }));

describe('PatientService', () => {
  const samplePatient: Patient = {
    id: '892b83e8-8ee0-48f6-a817-49eba8e93577',
    name: 'John Doe',
    address: '123 Main St',
    conditions: ['Diabetes'],
    allergies: ['Peanuts'],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addPatient', () => {
    it('should add a patient and index it in OpenSearch', async () => {
      const mockPatient = {
        id: '892b83e8-8ee0-48f6-a817-49eba8e93577',
        name: 'John Doe',
        address: '123 Main St',
        conditions: ['Diabetes'],
        allergies: ['Peanuts'],
      };

      // Call the function
      await patientService.addPatient(mockPatient);

      // Verify DynamoDB put call
      expect(dynamoClient.put).toHaveBeenCalledWith({
        TableName: 'Patients',
        Item: mockPatient,
      });

      // Verify OpenSearch index call
      expect(openSearchClient.index).toHaveBeenCalledWith({
        index: 'patients',
        id: '892b83e8-8ee0-48f6-a817-49eba8e93577',
        body: mockPatient,
      });
    });
  });

  describe('getPatients', () => {
    it('should fetch all patients', async () => {
      const mockPatients = { Items: [samplePatient] };
      (dynamoClient.scan as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue(mockPatients),
      });

      const patients = await patientService.getPatients();

      expect(dynamoClient.scan).toHaveBeenCalledWith({ TableName: 'Patients' });
      expect(patients).toEqual([samplePatient]);
    });
  });

  describe('getPatientById', () => {
    it('should fetch a patient by ID', async () => {
      (dynamoClient.get as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue({ Item: samplePatient }),
      });

      const patient = await patientService.getPatientById(samplePatient.id);

      expect(dynamoClient.get).toHaveBeenCalledWith({
        TableName: 'Patients',
        Key: { id: samplePatient.id },
      });
      expect(patient).toEqual(samplePatient);
    });
  });

  describe('updatePatient', () => {
    it('should update a patient and re-index it in OpenSearch', async () => {
      const updatedPatient = { ...samplePatient, name: 'Jane Doe' };
      (dynamoClient.update as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue({ Attributes: updatedPatient }),
      });

      const result = await patientService.updatePatient(
        samplePatient.id,
        updatedPatient
      );

      expect(dynamoClient.update).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: { id: samplePatient.id },
        })
      );
      expect(openSearchClient.index).toHaveBeenCalledWith({
        index: 'patients',
        id: samplePatient.id,
        body: updatedPatient,
      });
      expect(result).toEqual(updatedPatient);
    });
  });

  describe('deletePatient', () => {
    it('should delete a patient and remove it from OpenSearch', async () => {
      const mockId = '892b83e8-8ee0-48f6-a817-49eba8e93577';

      // Call the function
      await patientService.deletePatient(mockId);

      // Verify DynamoDB delete call
      expect(dynamoClient.delete).toHaveBeenCalledWith({
        TableName: 'Patients',
        Key: { id: mockId },
      });

      // Verify OpenSearch delete call
      expect(openSearchClient.delete).toHaveBeenCalledWith({
        index: 'patients',
        id: mockId,
      });
    });
  });


  describe('searchPatientsByaddress', () => {
    it('should search patients by address', async () => {
      const mockPatients = { Items: [samplePatient] };
      (dynamoClient.scan as jest.Mock).mockReturnValueOnce({
        promise: jest.fn().mockResolvedValue(mockPatients),
      });

      const result = await patientService.searchPatientsByaddress(
        samplePatient.address
      );

      expect(dynamoClient.scan).toHaveBeenCalledWith(
        expect.objectContaining({
          FilterExpression: expect.any(String),
        })
      );
      expect(result).toEqual([samplePatient]);
    });
  });

  describe('searchPatientsByConditionOpenSearch', () => {
    it('should search patients by condition using OpenSearch', async () => {
      const mockResponse = {
        body: {
          hits: {
            hits: [
              { _source: samplePatient },
            ],
          },
        },
      };

      (openSearchClient.search as jest.Mock).mockResolvedValue(mockResponse);

      const result = await patientService.searchPatientsByConditionOpenSearch(
        'Diabetes'
      );

      expect(openSearchClient.search).toHaveBeenCalledWith(
        expect.objectContaining({
          index: 'patients',
          body: expect.any(Object),
        })
      );
      expect(result).toEqual([samplePatient]);
    });
  });
});
