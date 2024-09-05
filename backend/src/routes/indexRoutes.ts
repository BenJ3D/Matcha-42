import {Router} from 'express';
import userRoute from "./userRoutes";
import loginRoutes from "./loginRoutes";

const router = Router();

router.use('/user', userRoute)
router.use('/login', loginRoutes)

export default router;
