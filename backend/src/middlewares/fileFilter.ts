import {Request} from 'express';
import {FileFilterCallback} from 'multer';
import path from "path";

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif'];
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        const error = new Error('Type de fichier non supporté. Seuls les fichiers JPEG, PNG et GIF sont acceptés.');
        //@ts-ignore
        error.status = 400;
        cb(error);
    }
};

export default imageFileFilter;