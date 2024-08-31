import { Router } from 'express';
import UserModel from '../models/UserModel';
import LikeModel from '../models/LikeModel';

const router = Router();

router.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    console.log("COUCOU");

    try {
        const user = await UserModel.findById(parseInt(id, 10));
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Récupérer les relations de l'utilisateur
        const likes = await LikeModel.findWithRelation(LikeModel, user.id);
        res.json({ user, likes });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

export default router;
