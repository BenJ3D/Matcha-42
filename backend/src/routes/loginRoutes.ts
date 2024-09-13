import {Router} from 'express';
import LoginController from "../controllers/loginController";

const router = Router();

router.post('/', LoginController.loginWithPassword);
router.post('/refresh', LoginController.refreshToken);

export default router;
