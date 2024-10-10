// src/server.ts
import express from 'express';
import {createServer} from "http";
import {Server} from "socket.io";
import config from './config/config';
import routes from './routes/indexRoutes';
import {query} from './config/db';
import {QueryResult} from 'pg';
import authMiddleware from "./middlewares/authMiddleware";
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from './config/swaggerConfig';
import {initializeSockets, onlineUsers} from './sockets/index';
import JwtService from "./services/JwtService";

const PORT = config.port || 8000;
const DATABASE_URL = config.database_url;
const app = express();

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

// Middleware pour gérer l'authentification des requêtes de manière globale
app.use(authMiddleware);

// Routeur centralisé
app.use('/api', routes);

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

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"]
    }
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    console.log(token);
    if (!token) {
        return next(new Error("Authentication error"));
    }

    try {
        const payload = JwtService.verifyAccessToken(token);
        if (payload && payload.id) {
            socket.data.userId = payload.id;
            return next();
        } else {
            return next(new Error("Authentication error"));
        }
    } catch (error) {
        return next(new Error("Authentication error"));
    }
});
// Initialiser Socket.IO avec les gestionnaires d'événements
initializeSockets(io);

httpServer.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le PORT: ${PORT}`);
    console.log(`Connecté à la base de données: ${config.database_name}`);
}).on('error', (error: Error) => {
    throw new Error(error.message);
});