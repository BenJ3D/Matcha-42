import { Router } from 'express';
import { getAnother } from '../controllers/anotherController';

const router = Router();

router.get('/', getAnother);

export default router;
