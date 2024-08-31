import { query } from './db'; // Assurez-vous d'importer la fonction de requête

class Model<T> {
    public tableName: string;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    // Méthode pour créer un enregistrement
    async create(fields: Partial<T>): Promise<T> {
        const keys = Object.keys(fields).join(', ');
        const values = Object.values(fields);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

        const result = await query(
            `INSERT INTO ${this.tableName} (${keys}) VALUES (${placeholders}) RETURNING *`,
            values
        );
        return result.rows[0];
    }

    // Méthode pour lire un enregistrement par ID
    async findById(id: number): Promise<T | null> {
        const result = await query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
        return result.rows.length ? result.rows[0] : null;
    }

    // Méthode pour mettre à jour un enregistrement
    async update(id: number, fields: Partial<T>): Promise<T | null> {
        const keys = Object.keys(fields);
        const values = Object.values(fields);
        const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

        const result = await query(
            `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows.length ? result.rows[0] : null;
    }

    // Méthode pour supprimer un enregistrement
    async delete(id: number): Promise<boolean> {
        const result = await query(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
        return result.rowCount !== null && result.rowCount > 0;
    }

    // Méthode pour trouver des enregistrements avec des critères spécifiques
    async find(criteria: Partial<T>): Promise<T[]> {
        const keys = Object.keys(criteria);
        const values = Object.values(criteria);
        const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

        const result = await query(`SELECT * FROM ${this.tableName} WHERE ${whereClause}`, values);
        return result.rows;
    }
}

export default Model;
