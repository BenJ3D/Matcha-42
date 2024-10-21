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
import emailVerificationRoutes from "./emailVerificationRoutes";
import photoRoutes from "./photoRoutes";
import verifyTokenRoutes from "./verifyTokenRoutes";

const router = Router();

router.use('/tags', tagsRoutes);
router.use('/users', userRoute);
router.use('/likes', likesRoutes);
router.use('/login', loginRoutes);
router.use('/photos', photoRoutes);
router.use('/messages', messageRoutes);
router.use('/matches', matchesRoutes);
router.use('/genders', gendersRoutes);
router.use('/unlikes', unlikesRoutes);
router.use('/profiles', profileRoutes);
router.use('/notifications', notificationsRoute);
router.use('/verify-email', emailVerificationRoutes)
router.use("/verify-token", verifyTokenRoutes);
router.use('/visited-profiles', visitedProfilesRoutes)


export default router;
