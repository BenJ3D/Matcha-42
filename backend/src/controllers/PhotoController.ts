import {Request, Response} from 'express';
import PhotoService from '../services/PhotoService';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import {AuthenticatedRequest} from '../middlewares/authMiddleware';

class PhotoController {
    // Méthode pour uploader une photo
    async uploadPhoto(req: AuthenticatedRequest, res: Response) {
        const file = req.file;
        const description = req.body.description || '';

        if (!file) {
            return res.status(400).json({error: 'Aucun fichier téléchargé. Assurez-vous que le champ est nommé "photo".'});
        }

        try {
            const userId = req.userId!;
            // Appeler le service pour gérer l'upload
            const photo = await PhotoService.uploadPhoto(userId, file, description);

            res.status(201).json({message: 'Photo uploadée avec succès.', photo});
        } catch (error: any) {
            console.error('Erreur lors de l\'upload de la photo:', error);
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }

    // Méthode pour supprimer une photo
    async deletePhoto(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const photoId = parseInt(req.params.photoId, 10);

            if (isNaN(photoId)) {
                return res.status(400).json({error: 'ID de photo invalide.'});
            }

            // Appeler le service pour supprimer la photo
            await PhotoService.deletePhoto(userId, photoId);

            res.json({message: 'Photo supprimée avec succès.'});
        } catch (error: any) {
            console.error('Erreur lors de la suppression de la photo:', error);
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }

    // Méthode pour définir une photo comme principale
    async setMainPhoto(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const photoId = parseInt(req.params.photoId, 10);

            if (isNaN(photoId)) {
                return res.status(400).json({error: 'ID de photo invalide.'});
            }

            // Appeler le service pour définir la photo principale
            await PhotoService.setMainPhoto(userId, photoId);

            res.json({message: 'Photo définie comme principale avec succès.'});
        } catch (error: any) {
            console.error('Erreur lors de la définition de la photo principale:', error);
            res.status(error.status || 400).json({error: error.message || 'Erreur'});
        }
    }
}

export default new PhotoController();