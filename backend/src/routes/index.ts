import { Router } from 'express';
import testRoute from './testRoute';
import anotherRoute from './anotherRoute';

const router = Router();

router.use('/test', testRoute);
router.use('/another', anotherRoute);

export default router;
