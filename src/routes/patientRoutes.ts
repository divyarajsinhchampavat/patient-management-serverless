import { Router } from 'express';
import {
  createPatientHandler,
  getPatientsHandler,
  getPatientByIdHandler,
  updatePatientHandler,
  deletePatientHandler,
  searchPatientsByConditionHandler,

} from '../controllers/patientController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search', authenticate, searchPatientsByConditionHandler);
router.post('/', authenticate, createPatientHandler);
router.get('/', authenticate, getPatientsHandler);
router.put('/:id', authenticate, updatePatientHandler);
router.get('/:id', authenticate, getPatientByIdHandler);
router.delete('/:id', authenticate, deletePatientHandler);

export default router;