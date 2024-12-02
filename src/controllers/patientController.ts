import { Request, Response } from 'express';
import { addPatient, getPatients, getPatientById, deletePatient,updatePatient,searchPatientsByCondition } from '../services/patientService';
import { createPatient } from '../models/Patient';

export const createPatientHandler = async (req: Request, res: Response) => {

  const { name, address, conditions, allergies } = req.body;
  const patient = createPatient(name, address, conditions, allergies);
  await addPatient(patient);
  res.status(201).json(patient);
};

export const getPatientsHandler = async (req: Request, res: Response) => {
  const patients = await getPatients();
  res.status(200).json(patients);
};

export const getPatientByIdHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  const patient = await getPatientById(id);
  if (!patient) return res.status(404).json({ error: 'Patient not found' }) as any;
  res.status(200).json(patient);
};
// Update a patient
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
  

export const deletePatientHandler = async (req: Request, res: Response) => {
  const { id } = req.params;
  await deletePatient(id);
  res.status(204).send();
};

// Search patients by condition (OpenSearch)
export const searchPatientsByConditionHandler = async (req: Request, res: Response) => {
    const { condition } = req.query;  // Get the condition from the query string

    try {
      const patients = await searchPatientsByCondition(condition as string);
      return res.status(200).json(patients) as any;
    } catch (error) {
      return res.status(500).json({ message: 'Error searching patients', error: error });
    }
  };