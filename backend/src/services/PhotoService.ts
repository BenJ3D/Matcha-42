import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import PhotoDAL from '../DataAccessLayer/PhotoDAL';
import ProfileDAL from '../DataAccessLayer/ProfileDAL';
import {Photo} from '../models/Photo';

class PhotoService {
    async uploadPhoto(userId: number, file: Express.Multer.File, description: string): Promise<Photo> {
        // Vérifier le nombre de photos de l'utilisateur
        const photoCount = await PhotoDAL.getPhotoCountByUser(userId);
        if (photoCount >= 5) {
            // Supprimer le fichier uploadé
            fs.unlinkSync(file.path);
            throw {status: 400, message: 'Vous avez atteint la limite de 5 photos.'};
        }

        // Traiter l'image avec sharp
        const processedFilePath = path.join('./uploads', `processed-${file.filename}`);

        try {
            await sharp(file.path)
                .resize({width: 800})
                .toFile(processedFilePath);
        } catch (err) {
            // Supprimer les fichiers temporaires
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            if (fs.existsSync(processedFilePath)) fs.unlinkSync(processedFilePath);
            throw {status: 400, message: 'Le fichier fourni n\'est pas une image valide ou est corrompu.'};
        }

        // Supprimer le fichier original
        fs.unlinkSync(file.path);

        // Continuer le reste du traitement...
        // Déplacer le fichier traité vers le dossier uploads
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        const finalFileName = `${Date.now()}-${file.originalname}`;
        const finalFilePath = path.join(uploadsDir, finalFileName);
        fs.renameSync(processedFilePath, finalFilePath);

        // Générer l'URL de la photo
        const photoUrl = `${process.env.BACK_URL}uploads/${finalFileName}`;

        // Enregistrer la photo dans la base de données
        const photo = await PhotoDAL.insertPhoto(userId, photoUrl, description);

        return photo;
    }

    async unsetMainPhoto(userId: number): Promise<void> {
        // Unset the main photo for the user
        await ProfileDAL.updateMainPhoto(userId, null);
    }

    async deletePhoto(userId: number, photoId: number): Promise<void> {
        // Verify that the photo belongs to the user
        const photo = await PhotoDAL.findPhotoById(photoId);
        if (!photo) {
            throw {status: 404, message: 'Photo non trouvée.'};
        }

        if (photo.owner_user_id !== userId) {
            throw {status: 403, message: 'Vous n\'êtes pas autorisé à supprimer cette photo.'};
        }

        // Check if the photo is the main photo
        const profile = await ProfileDAL.findByUserId(userId);
        if (profile?.main_photo_id === photoId) {
            // Unset the main photo
            await this.unsetMainPhoto(userId);
        }

        // Delete the photo
        await PhotoDAL.deletePhoto(photoId);
    }

    async setMainPhoto(userId: number, photoId: number): Promise<void> {
        // Vérifier que la photo appartient à l'utilisateur
        const photo = await PhotoDAL.findPhotoById(photoId);
        if (!photo) {
            throw {status: 404, message: 'Photo non trouvée.'};
        }

        if (photo.owner_user_id !== userId) {
            throw {status: 403, message: 'Vous n\'êtes pas autorisé à définir cette photo comme principale.'};
        }

        // Définir la photo comme principale
        await ProfileDAL.updateMainPhoto(userId, photoId);
    }
}

export default new PhotoService();