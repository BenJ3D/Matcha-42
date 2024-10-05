import {Router} from 'express';
import UnlikesController from '../controllers/UnlikesController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authMiddleware, UnlikesController.getMyUnlikes);
router.post('/:userId', authMiddleware, UnlikesController.addUnlike);
router.delete('/:userId', authMiddleware, UnlikesController.removeUnlike);

export default router;