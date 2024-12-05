import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import PhotoDAL from '../DataAccessLayer/PhotoDAL';
import ProfileDAL from '../DataAccessLayer/ProfileDAL';
import {Photo} from '../models/Photo';

class PhotoService {
    async uploadPhoto(userId: number, file: Express.Multer.File, description: string): Promise<Photo> {
        const photoCount = await PhotoDAL.getPhotoCountByUser(userId);
        if (photoCount >= 5) {
            fs.unlinkSync(file.path);
            throw {status: 400, message: 'You have reached the limit of 5 photos.'};
        }

        const processedFilePath = path.join('./uploads', `processed-${file.filename}`);

        try {
            await sharp(file.path)
                .resize({width: 800})
                .toFile(processedFilePath);
        } catch (err) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            if (fs.existsSync(processedFilePath)) fs.unlinkSync(processedFilePath);
            throw {status: 400, message: 'The file supplied is not a valid image or is corrupt.'};
        }

        fs.unlinkSync(file.path);

        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }
        const finalFileName = `${Date.now()}-${file.originalname}`;
        const finalFilePath = path.join(uploadsDir, finalFileName);
        fs.renameSync(processedFilePath, finalFilePath);

        const photoUrl = `${process.env.BACK_URL}uploads/${finalFileName}`;

        const photo = await PhotoDAL.insertPhoto(userId, photoUrl, description);

        return photo;
    }

    async unsetMainPhoto(userId: number): Promise<void> {
        await ProfileDAL.updateMainPhoto(userId, null);
    }

    async deletePhoto(userId: number, photoId: number): Promise<void> {
        const photo = await PhotoDAL.findPhotoById(photoId);
        if (!photo) {
            throw {status: 404, message: 'Photo not found.'};
        }

        if (photo.owner_user_id !== userId) {
            throw {status: 403, message: 'You are not authorized to delete this photo.'};
        }

        const profile = await ProfileDAL.findByUserId(userId);
        if (profile?.main_photo_id === photoId) {
            await this.unsetMainPhoto(userId);
        }

        await PhotoDAL.deletePhoto(photoId);
    }

    async setMainPhoto(userId: number, photoId: number): Promise<void> {
        const photo = await PhotoDAL.findPhotoById(photoId);
        if (!photo) {
            throw {status: 404, message: 'Photo not found.'};
        }

        if (photo.owner_user_id !== userId) {
            throw {status: 403, message: 'You are not allowed to set this photo as main.'};
        }

        await ProfileDAL.updateMainPhoto(userId, photoId);
    }
}

export default new PhotoService();