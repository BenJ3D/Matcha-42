import { Knex, knex } from 'knex';
import config from './config'

const knexConfig: Knex.Config = {
    client: 'pg', // Remplacez par 'pg' pour PostgreSQL, 'sqlite3' pour SQLite, etc.
    connection: {
        host: config.database_url,
        user: config.user,
        password: config.password,
        database: config.database_name,
    }
};

const db = knex(knexConfig);

export default db;
