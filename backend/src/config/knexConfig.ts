import {Knex, knex} from 'knex';
import config from './config'

const knexConfig: Knex.Config = {
    client: 'pg',
    connection: {
        host: config.databaseUrl,
        user: config.databaseUser,
        password: config.databasePassword,
        database: config.databaseName,
    }
};

const db = knex(knexConfig);

export default db;
