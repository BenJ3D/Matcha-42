// src/server.ts
import express from 'express';
import {createServer} from "http";
import {Server} from "socket.io";
import config from './config/config';
import routes from './routes/indexRoutes';
import {query} from './config/db';
import {QueryResult} from 'pg';
import authMiddleware from "./middlewares/authMiddleware";
import swaggerOptions from './config/swaggerConfig';
import cors from 'cors';
import initializeSockets from "./sockets";
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import path from "path";
import errorHandler from "./middlewares/errorHandler";

const PORT = config.apiPortInternal ?? 8000;
const DATABASE_URL = config.databaseUrl;
const app = express();

// Configurer CORS
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

// const onlineUsers = new Map<number, Socket>();
if (!PORT) {
    throw new Error('La variable d\'environnement PORT est manquante.');
}

if (!DATABASE_URL) {
    throw new Error('La variable d\'environnement DATABASE_URL est manquante.');
}

// Configuration de Swagger
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route pour accéder au JSON de la documentation
app.get('/api-docs.json', (req, res) => {
    res.json(swaggerSpec);
});

// Middleware pour parser les JSON
app.use(express.json());

// Configurer le dossier 'uploads' comme dossier de fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware pour gérer l'authentification des requêtes de manière globale
app.use(authMiddleware);

// Routeur centralisé
app.use('/api', routes);

// Utiliser la middleware de gestion des erreurs après les routes
app.use(errorHandler);

// Test de connexion à la base de données
query('SELECT NOW()')
    .then((result: QueryResult) => {
        console.log('Connexion à la base de données réussie:', result.rows[0]);
    })
    .catch((error: Error) => {
        console.error('Erreur de connexion à la base de données:', error);
    });

app.get('/', (req: express.Request, res: express.Response) => {
    res.send('Hello, world!');
});

const httpServer = createServer(app);
// const io = new Server(httpServer, {});

// Configurer CORS pour SocketIO
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

//Init logique sockets
initializeSockets(io);

httpServer.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le PORT: ${PORT}`);
    console.log(`Connecté à la base de données: ${config.databaseName}`);
}).on('error', (error: Error) => {
    throw new Error(error.message);
});