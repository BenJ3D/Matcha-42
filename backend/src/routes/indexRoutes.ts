import {Router} from 'express';
import userRoute from "./userRoutes";
import loginRoutes from "./loginRoutes";

const router = Router();

router.use('/users', userRoute)
router.use('/login', loginRoutes)

export default router;
