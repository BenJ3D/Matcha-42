import { query } from './customORM/db';
import express from 'express';
import config from './config';
import routes from './routes/index'; // Importez le routeur centralisé
import { QueryResult } from 'pg'; // Importez les types de pg si nécessaire

const PORT = config.port || 8000;
const DATABASE_URL = config.database_url;
const app = express();

if (!PORT) {
  throw new Error('La variable d\'environnement PORT est manquante.');
}

if (!DATABASE_URL) {
  throw new Error('La variable d\'environnement DATABASE_URL est manquante.');
}

// Middleware pour parser les JSON
app.use(express.json());

// Utiliser le routeur centralisé
app.use('/api', routes);

// Test de connexion à la base de données
query('SELECT NOW()')
    .then((result: QueryResult) => {  // Utilisation de `QueryResult` pour typage explicite
      console.log('Connection to the database successful:', result.rows[0]);
    })
    .catch((error: Error) => { // Typage explicite de l'erreur
      console.error('Error connecting to the database:', error);
    });

app.get('/', (req: express.Request, res: express.Response) => {  // Typage correct pour req et res
  res.send('Hello, world! MATCHA42 !');
});

app.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
  console.log(`Connected to the database at ${config.database_name}`);
}).on('error', (error: Error) => { // Typage explicite de l'erreur ici aussi
  throw new Error(error.message);
});
