import {SwaggerDefinition, Options} from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Documentation de l\'API Matcha',
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
            },
        },
        schemas: {
            // Schéma pour UserLightResponseDto
            UserLightResponseDto: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 1,
                    },
                    username: {
                        type: 'string',
                        example: 'johndoe',
                    },
                    main_photo_url: {
                        type: 'string',
                        example: 'https://example.com/photos/user1_photo.jpg',
                    },
                    age: {
                        type: 'integer',
                        example: 25,
                    },
                    gender: {
                        type: 'integer',
                        example: 5,
                    },
                    location: {
                        type: 'object',
                        properties: {
                            latitude: {type: 'number', example: 45.764043},
                            longitude: {type: 'number', example: 4.835659},
                            city_name: {type: 'string', example: 'Lyon'},
                        },
                    },
                },
            },
            ProfileCreateDto: {
                type: 'object',
                required: ['biography', 'gender', 'age'],
                properties: {
                    biography: {
                        type: 'string',
                        maxLength: 1024,
                        example: 'Je suis passionné par le développement web...',
                    },
                    gender: {
                        type: 'integer',
                        example: 5,
                        description: 'ID du genre (référence à la table genders)',
                    },
                    age: {
                        type: 'integer',
                        minimum: 18,
                        example: 25,
                    },
                    main_photo_id: {
                        type: 'integer',
                        example: 6,
                        description: 'ID de la photo principale (référence à la table photos)',
                    },
                    location: {
                        type: 'object',
                        properties: {
                            latitude: {type: 'number', example: 45.764043},
                            longitude: {type: 'number', example: 4.835659},
                        },
                        required: ['latitude', 'longitude'],
                        description: 'Coordonnées géographiques du profil',
                    },
                    tags: {
                        type: 'array',
                        items: {
                            type: 'integer',
                            example: 19,
                        },
                        description: 'Liste des IDs des tags (référence à la table tags)',
                    },
                    sexualPreferences: {
                        type: 'array',
                        items: {
                            type: 'integer',
                            example: 6,
                        },
                        description: 'Liste des IDs des préférences sexuelles (référence à la table genders)',
                    },
                },
            },
            ProfileUpdateDto: {
                type: 'object',
                properties: {
                    biography: {
                        type: 'string',
                        maxLength: 1024,
                        example: 'Mise à jour de ma biographie...',
                    },
                    gender: {
                        type: 'integer',
                        example: 6,
                        description: 'ID du genre (référence à la table genders)',
                    },
                    age: {
                        type: 'integer',
                        minimum: 18,
                        example: 29,
                    },
                    main_photo_id: {
                        type: 'integer',
                        example: 17,
                        description: 'ID de la photo principale (référence à la table photos)',
                    },
                    location: {
                        type: 'object',
                        properties: {
                            latitude: {type: 'number', example: 48.856614},
                            longitude: {type: 'number', example: 2.3522219},
                        },
                        required: ['latitude', 'longitude'],
                        description: 'Coordonnées géographiques du profil',
                    },
                    tags: {
                        type: 'array',
                        items: {
                            type: 'integer',
                            example: 21,
                        },
                        description: 'Liste des IDs des tags (référence à la table tags)',
                    },
                    sexualPreferences: {
                        type: 'array',
                        items: {
                            type: 'integer',
                            example: 13,
                        },
                        description: 'Liste des IDs des préférences sexuelles (référence à la table genders)',
                    },
                },
            },
            // Schéma pour ProfileResponseDto
            ProfileResponseDto: {
                type: 'object',
                properties: {
                    profile_id: {
                        type: 'integer',
                        example: 1,
                    },
                    owner_user_id: {
                        type: 'integer',
                        example: 1,
                    },
                    biography: {
                        type: 'string',
                        example: 'Je m\'appelle Ben, bonjour blablabla...',
                    },
                    gender: {
                        type: 'integer',
                        example: 5,
                    },
                    age: {
                        type: 'integer',
                        example: 34,
                    },
                    main_photo_id: {
                        type: 'integer',
                        example: 2,
                    },
                    main_photo_url: {
                        type: 'string',
                        example: 'https://example.com/photos/profile1_photo1.jpg',
                    },
                    photos: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Photo',
                        },
                    },
                    location: {
                        type: 'object',
                        properties: {
                            location_id: {type: 'integer', example: 1},
                            latitude: {type: 'number', example: 45.764043},
                            longitude: {type: 'number', example: 4.835659},
                            city_name: {type: 'string', example: 'Lyon'},
                        },
                    },
                    tags: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Tag',
                        },
                    },
                    fame_rating: {
                        type: 'integer',
                        example: 9,
                    },
                    last_connection: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-08-30T10:10:02.474Z',
                    },
                },
            },
            Photo: {
                type: 'object',
                properties: {
                    photo_id: {
                        type: 'integer',
                        example: 1,
                    },
                    url: {
                        type: 'string',
                        example: 'https://example.com/photos/profile1_photo1.jpg',
                    },
                    description: {
                        type: 'string',
                        example: 'Photo de profil',
                    },
                    owner_user_id: {
                        type: 'integer',
                        example: 1,
                    },
                },
            },
            Tag: {
                type: 'object',
                properties: {
                    tag_id: {
                        type: 'integer',
                        example: 19,
                    },
                    tag_name: {
                        type: 'string',
                        example: 'Gamer',
                    },
                },
            },
            CreateMessageDto: {
                type: 'object',
                required: ['target_user', 'content'],
                properties: {
                    target_user: {
                        type: 'integer',
                        example: 2,
                    },
                    content: {
                        type: 'string',
                        maxLength: 500,
                        example: 'Bonjour, comment ça va ?',
                    },
                },
            },
            Message: {
                type: 'object',
                properties: {
                    message_id: {
                        type: 'integer',
                        example: 1,
                    },
                    content: {
                        type: 'string',
                        example: 'Bonjour, comment ça va ?',
                    },
                    created_at: {
                        type: 'string',
                        format: 'date-time',
                        example: '2021-09-15T12:34:56Z',
                    },
                    owner_user: {
                        type: 'integer',
                        example: 1,
                    },
                    target_user: {
                        type: 'integer',
                        example: 2,
                    },
                },
            },
        },
    },
    security: [
        {
            BearerAuth: [],
        },
    ],
};

const options: Options = {
    swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export default options;