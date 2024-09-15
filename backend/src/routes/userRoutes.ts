import {Router} from 'express';
import UserController from "../controllers/userController";

const router = Router();

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Recherche avancée d'utilisateurs
 *     description: Recherche des utilisateurs selon des critères spécifiques (âge, localisation, notoriété, etc.).
 *     tags:
 *       - Utilisateurs
 *     parameters:
 *       - in: query
 *         name: ageMin
 *         schema:
 *           type: integer
 *         description: Âge minimum de l'utilisateur
 *       - in: query
 *         name: ageMax
 *         schema:
 *           type: integer
 *         description: Âge maximum de l'utilisateur
 *       - in: query
 *         name: fameMin
 *         schema:
 *           type: integer
 *         description: Notoriété minimale
 *       - in: query
 *         name: fameMax
 *         schema:
 *           type: integer
 *         description: Notoriété maximale
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Localisation de l'utilisateur
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           description: Liste des tags séparés par des virgules
 *       - in: query
 *         name: sexualPreferences
 *         schema:
 *           type: string
 *           description: Liste des préférences sexuelles séparées par des virgules
 *     responses:
 *       200:
 *         description: Liste des utilisateurs correspondant aux critères.
 */
router.get('/search', UserController.advancedSearch);

/**
 * @swagger
 * /users:
 *   post:
 *     security: []
 *     summary: Créer un nouvel utilisateur
 *     description: Crée un nouvel utilisateur avec les informations fournies.
 *     tags:
 *       - Utilisateurs
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nom d'utilisateur
 *                 example: "JeanDup"
 *               first_name:
 *                 type: string
 *                 description: Prénom de l'utilisateur
 *                 example: "DUPONT"
 *               last_name:
 *                 type: string
 *                 description: Nom de famille de l'utilisateur
 *                 example: "Jean"
 *               email:
 *                 type: string
 *                 description: Adresse email de l'utilisateur
 *                 example: "jean.dupont@mail.fr"
 *               password:
 *                 type: string
 *                 description: Mot de passe
 *                 example: "1234"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès.
 *       400:
 *         description: Erreur de validation ou email déjà pris.
 */

router.post('/', UserController.createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     description: Retourne une liste de tous les utilisateurs.
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
 *     description: Renvoie les informations de l'utilisateur connecté à partir du token JWT.
 *     tags:
 *       - Utilisateurs
 *     security:
 *       - BearerAuth: []
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
 *     summary: Récupérer un utilisateur par ID
 *     description: Retourne les informations d'un utilisateur en fonction de son ID.
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
 *         description: Utilisateur récupéré avec succès.
 *       404:
 *         description: Utilisateur non trouvé.
 */
router.get('/:id', UserController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     description: Met à jour les informations d'un utilisateur en fonction de son ID.
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
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès.
 *       400:
 *         description: Erreur de validation.
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
