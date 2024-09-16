import NodeGeocoder from 'node-geocoder';

const options: NodeGeocoder.Options = {
    provider: 'opencage',
    apiKey: 'e397c7937da741e8b03eb2cc6b33edb1', // TODO: si fonctionne=> déplacer dans .env
    formatter: null, // optionnel
};

const geocoder = NodeGeocoder(options);

export default geocoder;
