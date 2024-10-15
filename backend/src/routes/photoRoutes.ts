import {Router} from 'express';
import multer from 'multer';
import path from 'path';
import imageFileFilter from '../middlewares/fileFilter';
import PhotoController from '../controllers/PhotoController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Configuration de multer pour gérer les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp'); // Dossier temporaire
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
});

const upload = multer({
    storage,
    fileFilter: imageFileFilter,
    limits: {fileSize: 5 * 1024 * 1024}, // Limite de 5 MB
});

// Route pour uploader une photo
router.post('/', authMiddleware, upload.single('photo'), PhotoController.uploadPhoto);

// Route pour supprimer une photo
router.delete('/:photoId', authMiddleware, PhotoController.deletePhoto);

// Route pour définir une photo comme principale
router.post('/:photoId/set-main', authMiddleware, PhotoController.setMainPhoto);

export default router;