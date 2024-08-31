import { Router } from 'express';
import testRoute from './testRoute';
import anotherRoute from './anotherRoute';
import userRoute from "./UserRoute";

const router = Router();

router.use('/test', testRoute);
router.use('/another', anotherRoute);
router.use('/', userRoute)

export default router;
