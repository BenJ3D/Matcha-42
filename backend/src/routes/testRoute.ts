import { Router } from 'express';
import { getTest } from '../controllers/testController';

const router = Router();

router.get('/', getTest);

export default router;
