import {Router, Request, Response} from 'express';
import multer from 'multer';
import imageFileFilter from '../middlewares/fileFilter';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

// Configuration de multer pour gérer les fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp'); // Dossier où les images seront stockées temporairement
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: {fileSize: 5 * 1024 * 1024}, // Limite à 5 MB
});

// Route pour l'upload de photos
/**
 * @swagger
 * /photos:
 *   post:
 *     summary: Upload d'une photo
 *     tags:
 *       - Photos
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Le fichier image à uploader.
 *     responses:
 *       200:
 *         description: Photo uploadée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image traitée et enregistrée."
 *       400:
 *         description: Erreur lors de l'upload de l'image.
 */
router.post('/', authMiddleware, upload.single('photo'), async (req: Request, res: Response) => {
    const filePath = req.file?.path;
    const originalName = req.file?.originalname;

    if (!filePath || !originalName) {
        return res.status(400).send('Aucun fichier fourni.');
    }

    try {
        const outputDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        const outputFile = path.join(outputDir, `${Date.now()}-${originalName}`);

        // Traitement de l'image avec sharp
        await sharp(filePath)
            .resize({width: 800}) // Redimensionner la largeur à 800px
            .toFile(outputFile);

        // Supprimer le fichier original
        fs.unlinkSync(filePath);

        // Enregistrer les informations de la photo dans la base de données si nécessaire

        res.json({message: 'Image traitée et enregistrée.', file: outputFile});
    } catch (err) {
        console.error('Erreur lors du traitement de l\'image :', err);
        res.status(400).send('Erreur lors du traitement de l\'image.');
    }
});

export default router;