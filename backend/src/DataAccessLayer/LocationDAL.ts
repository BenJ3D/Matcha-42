import db from '../config/knexConfig';

interface Location {
    location_id: number;
    latitude: number;
    longitude: number;
    city_name?: string;
}

class LocationDAL {
    async findByCoordinates(latitude: number, longitude: number): Promise<Location | null> {
        const location = await db('locations')
            .select('*')
            .where({latitude, longitude})
            .first();
        return location || null;
    }

    async create(latitude: number, longitude: number, cityName: string | null): Promise<number> {
        const [{location_id}] = await db('locations')
            .insert({
                latitude,
                longitude,
                city_name: cityName,
            })
            .returning('location_id');

        return location_id;
    }
}

export default new LocationDAL();
