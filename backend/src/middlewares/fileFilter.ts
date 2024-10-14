import {Request} from 'express';
import {FileFilterCallback} from 'multer';

const imageFileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier non supporté. Seuls les JPEG et PNG sont acceptés.'));
    }
};

export default imageFileFilter;