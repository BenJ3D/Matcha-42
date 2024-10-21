import {Knex, knex} from 'knex';
import config from './config'

const knexConfig: Knex.Config = {
    client: 'pg', // Remplacez par 'pg' pour PostgreSQL, 'sqlite3' pour SQLite, etc.
    connection: {
        host: config.databaseUrl,
        user: config.databaseUser,
        password: config.databasePassword,
        database: config.databaseName,
    }
};

const db = knex(knexConfig);

export default db;
