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
            throw {status: 400, message: 'Vous avez atteint la limite de 5 photos.'};
        }

        // Traiter l'image avec sharp
        const processedFilePath = path.join('./uploads', `processed-${file.filename}`);
        await sharp(file.path)
            .resize({width: 800})
            .toFile(processedFilePath);

        // Supprimer le fichier original
        fs.unlinkSync(file.path);

        // Déplacer le fichier traité vers le dossier uploads
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        const finalFileName = `${Date.now()}-${file.originalname}`;
        const finalFilePath = path.join(uploadsDir, finalFileName);
        fs.renameSync(processedFilePath, finalFilePath);

        // Générer l'URL de la photo
        const photoUrl = `${process.env.BACK_URL}/uploads/${finalFileName}`;

        // Enregistrer la photo dans la base de données
        const photo = await PhotoDAL.insertPhoto(userId, photoUrl, description);

        return photo;
    }

    async deletePhoto(userId: number, photoId: number): Promise<void> {
        // Récupérer la photo
        const photo = await PhotoDAL.findPhotoById(photoId);
        if (!photo) {
            throw {status: 404, message: 'Photo non trouvée.'};
        }

        // Vérifier si l'utilisateur est le propriétaire
        if (photo.owner_user_id !== userId) {
            throw {status: 403, message: 'Vous n\'êtes pas autorisé à supprimer cette photo.'};
        }

        // Supprimer la photo de la base de données
        await PhotoDAL.deletePhoto(photoId);

        // Supprimer le fichier du système
        const filePath = path.join(__dirname, '../../uploads', path.basename(photo.url));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Vérifier si la photo supprimée est la photo principale
        const profile = await ProfileDAL.findByUserId(userId);
        if (profile && profile.main_photo_id === photoId) {
            // Si l'utilisateur a d'autres photos, définir la première comme principale
            const userPhotos = await PhotoDAL.getPhotosByUser(userId);
            const newMainPhotoId = userPhotos.length > 0 ? userPhotos[0].photo_id : null;
            await ProfileDAL.updateMainPhoto(userId, newMainPhotoId);
        }
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