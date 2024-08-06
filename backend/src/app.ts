import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes/index'; // Importez le routeur centralisé

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.API_PORT_INTERNAL || 3000;
const app = express();

// Middleware pour parser les JSON
app.use(express.json());

// Utiliser le routeur centralisé
app.use('/api', routes);


app.listen(PORT, () => {
  console.log(`Server running at PORT: ${PORT}`);
}).on('error', (error) => {
  throw new Error(error.message);
});

