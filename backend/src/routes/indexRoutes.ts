import {Router} from 'express';
import userRoute from "./userRoutes";

const router = Router();

router.use('/user', userRoute)

export default router;
