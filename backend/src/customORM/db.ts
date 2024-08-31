import config from '../config'
import {Pool} from 'pg'

const pool = new Pool({
    user: config.user,
    host: config.database_url,
    database: config.database_name,
    password: config.password,
    port: config.database_port,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
