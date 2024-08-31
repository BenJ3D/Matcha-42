import Model from './Model';
import { query } from "./db";
import LikeModel from "../models/LikeModel";

class RelationModel<T> extends Model<T> {
    constructor(tableName: string) {
        super(tableName); // Appeler le constructeur parent avec tableName
    }

    async findWithRelation<K>(
        relationField: LikeModel,
        userId: number
    ): Promise<K[]> {
        const result = await query(
            `SELECT * FROM ${this.tableName} WHERE "${relationField}" = $1`,
            [userId]
        );
        return result.rows;
    }
}

export default RelationModel;
