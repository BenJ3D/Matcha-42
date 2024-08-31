import { Request, Response } from 'express';
import UserModel from '../models/UserModel';
import RelationModel from '../customORM/RelationModel';

export const getUserDetails = async (req: Request, res: Response) => {
    const userId = Number(req.params.id);

    // Récupérer les informations de l'utilisateur
    const user = await UserModel.findById(userId);

    // Créer une instance de RelationModel avec le nom de la table 'likes'
    const relationModel = new RelationModel('likes');

    // Récupérer les likes faits par l'utilisateur
    const likesGiven = await relationModel.findWithRelation('user', userId);

    // Récupérer les likes reçus par l'utilisateur
    const likesReceived = await relationModel.findWithRelation('user_liked', userId);

    res.json({
        user,
        likesGiven,    // Likes faits par cet utilisateur
        likesReceived  // Likes reçus par cet utilisateur
    });
};
