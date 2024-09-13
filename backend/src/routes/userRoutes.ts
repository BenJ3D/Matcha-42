import {Router} from 'express';
import UserController from "../controllers/userController";

const router = Router();

router.get('/search', UserController.advancedSearch);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     description: Crée un nouvel utilisateur et renvoie l'ID de l'utilisateur créé.
 *     tags:
 *       - Utilisateurs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       400:
 *         description: Validation échouée.
 */
router.post('/', UserController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtenir tous les utilisateurs
 *     description: Renvoie une liste de tous les utilisateurs.
 *     tags:
 *       - Utilisateurs
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès.
 */
router.get('/', UserController.getAllUsers);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     description: Renvoie les informations du compte utilisateur connecté, selon le token fourni.
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur connecté récupérées avec succès.
 *       401:
 *         description: Non autorisé.
 */
router.get('/me', UserController.getMe);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtenir un utilisateur par ID
 *     description: Récupère les informations d'un utilisateur spécifique par son ID.
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Informations de l'utilisateur récupérées avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.get('/:id', UserController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     description: Met à jour les informations d'un utilisateur spécifique par son ID.
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *       400:
 *         description: Validation échouée.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.put('/:id', UserController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un utilisateur par son ID.
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de l'utilisateur à supprimer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.delete('/:id', UserController.deleteUser);

export default router;
