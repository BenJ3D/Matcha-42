import {Router} from 'express';
import multer from 'multer';
import path from 'path';
import imageFileFilter from '../middlewares/fileFilter';
import PhotoController from '../controllers/PhotoController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '/tmp');
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
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
    },
});

/**
 * @swagger
 * /photos:
 *   post:
 *     summary: Uploader une photo
 *     tags:
 *       - Photos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: La photo à uploader. Doit être une image valide.
 *               description:
 *                 type: string
 *                 description: Description optionnelle de la photo.
 *     responses:
 *       201:
 *         description: Photo uploadée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PhotoResponseDto'
 *       400:
 *         description: Erreur de validation des données ou requête invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Non autorisé. Token manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authMiddleware, upload.single('photo'), PhotoController.uploadPhoto);

/**
 * @swagger
 * /photos/{photoId}:
 *   delete:
 *     summary: Supprimer une photo
 *     tags:
 *       - Photos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la photo à supprimer.
 *     responses:
 *       200:
 *         description: Photo supprimée avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Photo supprimée avec succès."
 *       400:
 *         description: ID de photo invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Non autorisé. Token manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Non autorisé à supprimer cette photo.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Photo non trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:photoId', authMiddleware, PhotoController.deletePhoto);

/**
 * @swagger
 * /photos/{photoId}/set-main:
 *   post:
 *     summary: Définir une photo comme principale
 *     tags:
 *       - Photos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la photo à définir comme principale.
 *     responses:
 *       200:
 *         description: Photo définie comme principale avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Photo définie comme principale avec succès."
 *       400:
 *         description: ID de photo invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Non autorisé. Token manquant ou invalide.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Non autorisé à définir cette photo comme principale.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Photo non trouvée.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:photoId/set-main', authMiddleware, PhotoController.setMainPhoto);

export default router;