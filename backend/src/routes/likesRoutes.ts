import {Router} from 'express';
import LikesController from '../controllers/LikesController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, LikesController.getMyLikes);
router.post('/:userId', authMiddleware, LikesController.likeUser);
router.delete('/:userId', authMiddleware, LikesController.unlikeUser);

export default router;