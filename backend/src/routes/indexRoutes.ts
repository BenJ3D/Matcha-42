import {Router} from 'express';
import userRoute from "./userRoutes";
import tagsRoutes from "./tagsRoutes";
import loginRoutes from "./loginRoutes";
import profileRoutes from './profileRoutes';
import gendersRoutes from "./gendersRoutes";
import likesRoutes from "./likesRoutes";
import matchesRoutes from "./matchesRoutes";
import unlikesRoutes from "./unlikesRoutes";
import messageRoutes from "./messageRoutes";
import notificationsRoute from "./notificationsRoute";
import visitedProfilesRoutes from "./visitedProfilesRoutes";

const router = Router();

router.use('/tags', tagsRoutes);
router.use('/users', userRoute);
router.use('/likes', likesRoutes);
router.use('/login', loginRoutes);
router.use('/messages', messageRoutes);
router.use('/matches', matchesRoutes);
router.use('/genders', gendersRoutes);
router.use('/unlikes', unlikesRoutes);
router.use('/profiles', profileRoutes);
router.use('/notifications', notificationsRoute);
router.use('/visited-profiles', visitedProfilesRoutes)


export default router;
