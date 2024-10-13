import config from './config'
import {Pool} from 'pg'

const pool = new Pool({
    user: config.databaseUser,
    host: config.databaseUrl,
    database: config.databaseName,
    password: config.databasePassword,
    port: config.databasePort,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
