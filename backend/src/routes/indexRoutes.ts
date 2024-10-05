import {Router} from 'express';
import userRoute from "./userRoutes";
import loginRoutes from "./loginRoutes";
import profileRoutes from './profileRoutes';
import gendersRoutes from "./gendersRoutes";
import tagsRoutes from "./tagsRoutes";
import natchesRoutes from "./matchesRoutes";

const router = Router();

router.use('/users', userRoute);
router.use('/login', loginRoutes);
router.use('/profiles', profileRoutes);
router.use('/genders', gendersRoutes);
router.use('/tags', tagsRoutes);
router.use('/matches', natchesRoutes);


export default router;
