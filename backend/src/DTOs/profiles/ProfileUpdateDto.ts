import joi from 'joi';

export interface ProfileUpdateDto {
    biography?: string;
    gender?: number;
    age?: number;
    main_photo_id?: number;
    location?: number;
    tags?: number[];
    sexualPreferences?: number[];
}

export const ProfileUpdateDtoValidation = joi.object({
    biography: joi.string().max(1024),
    gender: joi.number().integer(),
    age: joi.number().integer().min(18),
    main_photo_id: joi.number().integer(),
    location: joi.number().integer(),
    tags: joi.array().items(joi.number().integer()),
    sexualPreferences: joi.array().items(joi.number().integer()),
});
