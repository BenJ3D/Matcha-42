import joi from 'joi';

export interface ProfileCreateDto {
    biography: string;
    gender: number;
    age: number;
    main_photo_id?: number;
    location?: number;
    tags?: number[];
    sexualPreferences?: number[];
}

export const ProfileCreateDtoValidation = joi.object({
    biography: joi.string().max(1024).required(),
    gender: joi.number().integer().required(),
    age: joi.number().integer().min(18).required(),
    main_photo_id: joi.number().integer(),
    location: joi.number().integer(),
    tags: joi.array().items(joi.number().integer()),
    sexualPreferences: joi.array().items(joi.number().integer()),
});
