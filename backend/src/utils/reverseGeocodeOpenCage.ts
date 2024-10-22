import axios from 'axios';
import config from "../config/config";

interface OpenCageComponents {
    city?: string;
    town?: string;
    township?: string;
    neighborhood?: string;
    suburb?: string;
    city_district?: string;
    _normalized_city?: string;

    [key: string]: any;
}

interface OpenCageResult {
    components: OpenCageComponents;

    [key: string]: any;
}

export async function reverseGeocodeOpenCage(lat: number, lon: number): Promise<string> {

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${config.opencageApi}&no_annotations=1&language=fr`;

    try {
        const response = await axios.get(url);
        console.log(response);
        const data = response.data;

        if (data.results && data.results.length > 0) {
            const components: OpenCageComponents = data.results[0].components;

            // Priorité des champs pour normalized_city
            const cityName = components._normalized_city
                || components.city
                || components.town
                || components.township
                || components.neighborhood
                || components.suburb
                || components.city_district
                || components.county
                || components.state
                || 'Unknown';

            return cityName;
        } else {
            return 'Unknown';
        }
    } catch (error) {
        console.error('Erreur lors du géocodage inverse OpenCage:', error);
        return 'Unknown';
    }
}