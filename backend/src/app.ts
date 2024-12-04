import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import config from './config/config';
import routes from './routes/indexRoutes';
import { query } from './config/db';
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

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

if (!PORT) {
  throw new Error('La variable d\'environnement PORT est manquante.');
}

if (!DATABASE_URL) {
  throw new Error('La variable d\'environnement DATABASE_URL est manquante.');
}

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/api-docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(authMiddleware);

app.use('/api', routes);

app.use(errorHandler);

const connectWithRetry = async (delay: number = 5000) => {
  while (true) {
    try {
      await query('SELECT NOW()');
      break;
    } catch (error) {
      await new Promise(res => setTimeout(res, delay));
    }
  }
};

const httpServer = createServer(app);

(async () => {
  await connectWithRetry();

  httpServer.listen(PORT, () => {
  }).on('error', (error: Error) => {
    throw new Error(error.message);
  });
})();

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello, world!');
});

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initializeSockets(io);