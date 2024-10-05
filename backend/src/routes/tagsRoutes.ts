import {Router} from 'express';
import TagsController from '../controllers/TagsController';
import {validateIdMiddleware} from "../middlewares/validateIdMiddleware";

const router = Router();

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Récupérer tous les tags disponibles
 *     tags:
 *       - Tags
 *     responses:
 *       200:
 *         description: Liste des tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 */
router.get('/', TagsController.getAllTags);

/**
 * @swagger
 * /tags/{tagId}:
 *   get:
 *     summary: Récupérer un tag par son ID
 *     tags:
 *       - Tags
 *     parameters:
 *       - in: path
 *         name: tagId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID du tag à récupérer
 *     responses:
 *       200:
 *         description: Tag récupéré
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Tag non trouvé
 *       400:
 *         description: ID de tag invalide
 */
router.get('/:tagId', validateIdMiddleware, TagsController.getTagById);

export default router;