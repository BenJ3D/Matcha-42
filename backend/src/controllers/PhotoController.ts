import { Response } from 'express';
import PhotoService from '../services/PhotoService';

import fileType from 'file-type';
import fs from 'fs';
import sharp from 'sharp';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

class PhotoController {
    async uploadPhoto(req: AuthenticatedRequest, res: Response) {
        const file = req.file;
        const description = req.body.description || '';

        if (!file) {
            return res.status(400).json({ error: 'Aucun fichier téléchargé. Assurez-vous que le champ est nommé "photo".' });
        }

        try {
            const userId = req.userId!;
            const buffer = fs.readFileSync(file.path);
            const type = await fileType.fromBuffer(buffer);

            if (!type || (type.mime !== 'image/jpeg' && type.mime !== 'image/png')) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: 'Le fichier fourni n\'est pas une image valide.' });
            }

            try {
                await sharp(file.path).metadata();
            } catch (err) {
                fs.unlinkSync(file.path);
                return res.status(400).json({ error: 'L\'image est corrompue ou invalide.' });
            }

            const photo = await PhotoService.uploadPhoto(userId, file, description);

            res.status(201).json({ message: 'Photo uploadée avec succès.', photo });
        } catch (error: any) {
            res.status(error.status || 500).json({ error: error.message || 'Erreur' });
        }
    }

    async deletePhoto(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const photoId = parseInt(req.params.photoId, 10);

            if (isNaN(photoId)) {
                return res.status(400).json({ error: 'ID de photo invalide.' });
            }

            await PhotoService.deletePhoto(userId, photoId);

            res.json({ message: 'Photo supprimée avec succès.' });
        } catch (error: any) {
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }

    async setMainPhoto(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.userId!;
            const photoId = parseInt(req.params.photoId, 10);

            if (isNaN(photoId)) {
                return res.status(400).json({ error: 'ID de photo invalide.' });
            }
            await PhotoService.setMainPhoto(userId, photoId);

            res.json({ message: 'Photo définie comme principale avec succès.' });
        } catch (error: any) {
            res.status(error.status || 400).json({ error: error.message || 'Erreur' });
        }
    }
}

export default new PhotoController();