import dotenv from 'dotenv';

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

// Récupérer les variables d'environnement
const API_PORT_INTERNAL = process.env.API_PORT_INTERNAL;
const API_PORT_EXTERNAL = process.env.API_PORT_EXTERNAL ?? '8000';
const FRONT_PORT_EXTERNAL = process.env.FRONT_PORT_EXTERNAL ?? '4200';

const FRONT_URL = process.env.FRONT_URL;

const POSTGRES_DB = process.env.POSTGRES_DB;
const DATABASE_PORT = process.env.DATABASE_PORT;
const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'postgres';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const JWT_EMAIL_SECRET = process.env.JWT_EMAIL;
const JWT_EMAIL_EXPIRATION = process.env.JWT_EMAIL_EXPIRATION ?? '10m';
const JWT_RESET_PASSWORD = process.env.JWT_RESET_PASSWORD;

const OPENCAGE_API = process.env.OPENCAGE_API;

const USER_PASSWORD_STRENGTH_SCORE = process.env.USER_PASSWORD_STRENGTH_SCORE ?? '4';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM;

// Validation des variables d'environnement obligatoires
if (!API_PORT_INTERNAL) {
    throw new Error('La variable d\'environnement API_PORT_INTERNAL est manquante.');
}

if (!API_PORT_EXTERNAL) {
    throw new Error('La variable d\'environnement API_PORT_EXTERNAL est manquante.');
}

if (!FRONT_PORT_EXTERNAL) {
    throw new Error('La variable d\'environnement FRONT_PORT_EXTERNAL est manquante.');
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

if (!JWT_SECRET) {
    throw new Error('La variable d\'environnement JWT_SECRET est manquante.');
}

if (!REFRESH_TOKEN_SECRET) {
    throw new Error('La variable d\'environnement REFRESH_TOKEN_SECRET est manquante.');
}

if (!JWT_EMAIL_SECRET) {
    throw new Error('La variable d\'environnement JWT_EMAIL est manquante.');
}

if (!OPENCAGE_API) {
    throw new Error('La variable d\'environnement OPENCAGE_API est manquante.');
}

if (!SMTP_HOST) {
    throw new Error('La variable d\'environnement SMTP_HOST est manquante.');
}

if (!SMTP_PORT) {
    throw new Error('La variable d\'environnement SMTP_PORT est manquante.');
}

if (!SMTP_USER) {
    throw new Error('La variable d\'environnement SMTP_USER est manquante.');
}

if (!SMTP_PASS) {
    throw new Error('La variable d\'environnement SMTP_PASS est manquante.');
}

if (!EMAIL_FROM) {
    throw new Error('La variable d\'environnement EMAIL_FROM est manquante.');
}

if (!FRONT_URL) {
    throw new Error('La variable d\'environnement FRONT_URL est manquante.');
}

if (!JWT_RESET_PASSWORD) {
    throw new Error('La variable d\'environnement JWT_RESET_PASSWORD est manquante.');
}

// Validation supplémentaire pour les variables numériques ou booléennes
const parsedDatabasePort = parseInt(DATABASE_PORT, 10);
if (isNaN(parsedDatabasePort) || parsedDatabasePort <= 0) {
    throw new Error('La variable d\'environnement DATABASE_PORT doit être un nombre positif valide.');
}

const parsedApiPortInternal = parseInt(API_PORT_INTERNAL, 10);
if (isNaN(parsedApiPortInternal) || parsedApiPortInternal <= 0) {
    throw new Error('La variable d\'environnement API_PORT_INTERNAL doit être un nombre positif valide.');
}

const parsedApiPortExternal = parseInt(API_PORT_EXTERNAL, 10);
if (isNaN(parsedApiPortExternal) || parsedApiPortExternal <= 0) {
    throw new Error('La variable d\'environnement API_PORT_EXTERNAL doit être un nombre positif valide.');
}

const parsedFrontPortExternal = parseInt(FRONT_PORT_EXTERNAL, 10);
if (isNaN(parsedFrontPortExternal) || parsedFrontPortExternal <= 0) {
    throw new Error('La variable d\'environnement FRONT_PORT_EXTERNAL doit être un nombre positif valide.');
}

const parsedSmtpPort = parseInt(SMTP_PORT, 10);
if (isNaN(parsedSmtpPort) || parsedSmtpPort <= 0) {
    throw new Error('La variable d\'environnement SMTP_PORT doit être un nombre positif valide.');
}

const parsedPasswordStrengthScore = parseInt(USER_PASSWORD_STRENGTH_SCORE, 10);
if (isNaN(parsedPasswordStrengthScore) || parsedPasswordStrengthScore < 0 || parsedPasswordStrengthScore > 4) {
    throw new Error('La variable d\'environnement USER_PASSWORD_STRENGTH_SCORE doit être un nombre entre 0 et 4.');
}

export default {
    // Ports
    apiPortInternal: parsedApiPortInternal,
    apiPortExternal: parsedApiPortExternal,
    frontPortExternal: parsedFrontPortExternal,

    // Domain front
    frontUrl: FRONT_URL,

    // Base de données PostgreSQL
    databaseUrl: POSTGRES_HOST,
    databasePort: parsedDatabasePort,
    databaseName: POSTGRES_DB,
    databaseUser: POSTGRES_USER,
    databasePassword: POSTGRES_PASSWORD,

    // JWT
    jwtSecret: JWT_SECRET,
    refreshTokenSecret: REFRESH_TOKEN_SECRET,
    jwtEmailSecret: JWT_EMAIL_SECRET,
    jwtPassResetSecret: JWT_RESET_PASSWORD,
    jwtEmailExpiration: JWT_EMAIL_EXPIRATION,

    // API externes
    opencageApi: OPENCAGE_API,

    // Sécurité des mots de passe
    userPasswordStrengthForce: parsedPasswordStrengthScore,

    // Configuration SMTP
    smtpHost: SMTP_HOST,
    smtpPort: parsedSmtpPort,
    smtpSecure: SMTP_SECURE,
    smtpUser: SMTP_USER,
    smtpPass: SMTP_PASS,
    emailFrom: EMAIL_FROM,
};