import { Request, Response } from 'express';
import { addPatient, getPatients, getPatientById, deletePatient,updatePatient, searchPatientsByaddress , searchPatientsByConditionOpenSearch} from '../services/patientService';
import { createPatient } from '../models/Patient';

//ANCHOR - Handler to create patient
export const createPatientHandler = async (req: Request, res: Response) => {
  const { name, address, conditions, allergies } = req.body;
  const patient = createPatient(name, address, conditions, allergies);
  await addPatient(patient);
  res.status(201).json(patient);
};

//ANCHOR - Handler to get all patient
export const getPatientsHandler = async (req: Request, res: Response) => {
  const patients = await getPatients();
  res.status(200).json(patients);
};

//ANCHOR - Handler to get patient by ID 
export const getPatientByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await getPatientById(id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' }) as any;
  res.status(200).json(patient);
};

//ANCHOR - Handler to Update a patient
export const updatePatientHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updatedData = req.body;  // Get the updated data from the request body
  
    try {
      const patient = await updatePatient(id, updatedData);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' }) as any;
      }
      return res.status(200).json(patient) as any;
    } catch (error) {
      return res.status(500).json({ message: 'Error updating patient', error: error });
    }
  };
  
//ANCHOR - Handler to delete a patient 
export const deletePatientHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await deletePatient(id);

    if (result.message.includes('not found')) {
      return res.status(404).json({ message: result.message }); // 404 if patient not found
    }

    return res.status(200).json({ message: result.message }) as any;
  } catch (error) {
    console.error(`Error deleting patient: ${error}`);
    return res.status(500).json({ message: 'Failed to delete patient', error: error });
  }
};
//ANCHOR - Handler to Search patients by address
export const searchPatientsByAddressHandler = async (req: Request, res: Response) => {
    const { address } = req.query;  // Get the address from the query string

    try {
      const patients = await searchPatientsByaddress(address as string);
      return res.status(200).json(patients) as any;
    } catch (error) {
      return res.status(500).json({ message: 'Error searching patients', error: error });
    }
  };

//ANCHOR - Handler to search patients by condition (OpenSearch)
  export const searchPatientsByConditionHandlerOpenSearch = async (req: Request, res: Response) => {
    const { condition } = req.query; // Get the condition from the query string
  
    if (!condition) {
      return res.status(400).json({ message: 'Condition is required for search' });
    }
    try {
      const patients = await searchPatientsByConditionOpenSearch(condition as string);
      return res.status(200).json(patients) as any;
    } catch (error) {
      console.error('Error searching patients:', error);
      return res.status(500).json({ message: 'Error searching patients', error: error });
    }
  };
  