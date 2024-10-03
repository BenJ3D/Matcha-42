import {Router} from 'express';
import userRoute from "./userRoutes";
import loginRoutes from "./loginRoutes";
import profileRoutes from './profileRoutes';
import gendersRoutes from "./gendersRoutes";

const router = Router();

router.use('/users', userRoute);
router.use('/login', loginRoutes);
router.use('/profiles', profileRoutes);
router.use('/genders', gendersRoutes);

export default router;
