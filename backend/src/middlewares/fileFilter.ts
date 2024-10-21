import {Request} from 'express';
import {FileFilterCallback} from 'multer';
import path from "path";

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    const allowedExtensions = ['.jpeg', '.jpg', '.png'];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Seuls les fichiers JPEG et PNG sont acceptés.'));
    }
};

export default imageFileFilter;