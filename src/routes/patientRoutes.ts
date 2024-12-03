import { Router } from 'express';
import {
  createPatientHandler,
  getPatientsHandler,
  getPatientByIdHandler,
  updatePatientHandler,
  deletePatientHandler,
  searchPatientsByAddressHandler,
  searchPatientsByConditionHandlerOpenSearch,

} from '../controllers/patientController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/search/address', authenticate, searchPatientsByAddressHandler);
router.get('/search/condition',authenticate, searchPatientsByConditionHandlerOpenSearch);
router.post('/', authenticate, createPatientHandler);
router.get('/', authenticate, getPatientsHandler);
router.put('/:id', authenticate, updatePatientHandler);
router.get('/:id', authenticate, getPatientByIdHandler);
router.delete('/:id', authenticate, deletePatientHandler);

export default router;