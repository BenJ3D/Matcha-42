// @ts-ignore
import {SwaggerDefinition, Options} from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Matcha API Documentation',
        version: '1.0.0',
        description: 'Documentation de l\'API pour Matcha',
    },
    servers: [
        {
            url: 'http://localhost:8000/api',
        },
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            }
        }
    },
    security: [{
        BearerAuth: []
    }]
};

const options: Options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Chemins où Swagger doit chercher les annotations
};

export default options;
