import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Valider et exporter les variables d'environnement nécessaires
const API_PORT = process.env.API_PORT_INTERNAL;


const POSTGRES_DB = process.env.POSTGRES_DB;
const DATABASE_PORT = process.env.DATABASE_PORT;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'postgres';
const USER_PASSWORD_STRENGTH_SCORE = process.env.PASSWORD_STRENGTH_SCORE || '4';


if (!API_PORT) {
    throw new Error('La variable d\'environnement API_PORT est manquante.');
}

if (!POSTGRES_DB) {
    throw new Error('La variable d\'environnement POSTGRES_DB est manquante.');
}

if (!DATABASE_PORT) {
    throw new Error('La variable d\'environnement DATABASE_PORT est manquante.');
}

if (!POSTGRES_USER) {
    throw new Error('La variable d\'environnement POSTGRES_USER est manquante.');
}

if (!POSTGRES_PASSWORD) {
    throw new Error('La variable d\'environnement POSTGRES_PASSWORD est manquante.');
}

export default {
    port: parseInt(API_PORT, 10),
    database_url: POSTGRES_HOST,
    database_port: parseInt(DATABASE_PORT, 10),
    database_name: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    user_password_strength_force: parseInt(USER_PASSWORD_STRENGTH_SCORE, 10),
};
