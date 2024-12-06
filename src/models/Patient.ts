import { v4 as uuidv4 } from 'uuid';
export interface Patient {
  id: string;
  name: string;
  address: string;
  conditions: string[];
  allergies: string[];
}

export const createPatient = (
  name: string,
  address: string,
  conditions: string[],
  allergies: string[]
): Patient => {
  return {
    id: uuidv4(),
    name,
    address,
    conditions,
    allergies,
  };
};
