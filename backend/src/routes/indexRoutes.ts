import {Router} from 'express';
import userRoute from "./userRoutes";
import loginRoutes from "./loginRoutes";
import profileRoutes from './profileRoutes';
import gendersRoutes from "./gendersRoutes";
import tagsRoutes from "./tagsRoutes";
import natchesRoutes from "./matchesRoutes";
import likesRoutes from "./likesRoutes";
import unlikesRoutes from "./unlikesRoutes";
import visitedProfilesRoutes from "./visitedProfilesRoutes";
import notificationsRoute from "./notificationsRoute";
import verifyTokenRoutes from "./verifyTokenRoutes";

const router = Router();

router.use('/users', userRoute);
router.use('/login', loginRoutes);
router.use('/profiles', profileRoutes);
router.use('/genders', gendersRoutes);
router.use('/tags', tagsRoutes);
router.use('/likes', likesRoutes);
router.use('/unlikes', unlikesRoutes);
router.use('/visited-profiles', visitedProfilesRoutes)
router.use('/matches', natchesRoutes);
router.use('/notifications', notificationsRoute);
router.use('/verify-token', verifyTokenRoutes);


export default router;
