import {Router} from 'express';
import UserController from "../controllers/userController";

const router = Router();

router.get('/search', UserController.advancedSearch);
router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/me', UserController.getMe);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
