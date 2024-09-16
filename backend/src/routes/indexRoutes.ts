import {Router} from 'express';
import userRoute from "./userRoutes";
import loginRoutes from "./loginRoutes";
import profileRoutes from './profileRoutes';

const router = Router();

router.use('/users', userRoute);
router.use('/login', loginRoutes);
router.use('/profiles', profileRoutes);

export default router;
