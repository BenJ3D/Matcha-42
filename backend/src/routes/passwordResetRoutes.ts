import { Router } from 'express';
import PasswordResetController from '../controllers/PasswordResetController';


const router = Router();

router.post('/request', PasswordResetController.requestPasswordReset);
router.post('/reset', PasswordResetController.resetPassword);

export default router;