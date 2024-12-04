import {Router} from 'express';
import axios from 'axios';
import config from '../config/config';

const router = Router();

interface OpenCageComponents {
    _normalized_city?: string;
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
    region?: string;

    [key: string]: any;
}

interface OpenCageResult {
    components: OpenCageComponents;
    geometry: {
        lat: number;
        lng: number;
    };
}

interface CityInfo {
    name: string;
    latitude: number;
    longitude: number;
    postalCode?: string;
    country?: string;
    region?: string;
}


/**
 * @swagger
 * /geocode:
 *   get:
 *     summary: Géocodage direct de villes
 *     description: Renvoie les informations des villes correspondant à la requête fournie.
 *     tags:
 *       - Geocoding
 *     parameters:
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         required: true
 *         description: Partie du nom de la ville à rechercher.
 *     responses:
 *       200:
 *         description: Informations des villes obtenues avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Nom de la ville.
 *                   latitude:
 *                     type: number
 *                     description: Latitude de la ville.
 *                   longitude:
 *                     type: number
 *                     description: Longitude de la ville.
 *                   postalCode:
 *                     type: string
 *                     description: Code postal de la ville.
 *                   country:
 *                     type: string
 *                     description: Pays de la ville.
 *                   region:
 *                     type: string
 *                     description: Région de la ville.
 *       400:
 *         description: Paramètre de requête manquant ou invalide.
 *       500:
 *         description: Erreur interne du serveur.
 */
router.get('/', async (req, res) => {
    const {address} = req.query;

    if (!address || typeof address !== 'string') {
        return res.status(400).json({error: 'Paramètre de requête manquant ou invalide.'});
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${config.opencageApi}&pretty=1&limit=10&no_dedupe=1&no_annotations=1`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.results && data.results.length > 0) {
            const cityInfos: CityInfo[] = data.results.map((result: OpenCageResult) => {
                const components = result.components;
                return {
                    name: components._normalized_city || components.city || components.town || components.village || 'Unknown',
                    latitude: result.geometry.lat,
                    longitude: result.geometry.lng,
                    postalCode: components.postcode,
                    country: components.country,
                    region: components.region
                };
            }).filter((info: CityInfo) => info.name !== 'Unknown');

            const uniqueCityInfos = Array.from(new Set(cityInfos.map(info => JSON.stringify(info)))).map(info => JSON.parse(info));

            return res.status(200).json(uniqueCityInfos);
        } else {
            return res.status(404).json({error: 'Aucun résultat trouvé.'});
        }
    } catch (error) {
        return res.status(500).json({error: 'Erreur interne du serveur.'});
    }
});

export default router;