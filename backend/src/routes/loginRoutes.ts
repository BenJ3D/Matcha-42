import {Router} from 'express';
import UserController from "../controllers/userController";
import LoginController from "../controllers/loginController";

const router = Router();

router.post('/', LoginController.loginWithPassword);

export default router;
