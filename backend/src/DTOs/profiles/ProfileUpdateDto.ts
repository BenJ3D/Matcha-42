import joi from 'joi';
import { LocationDto, LocationDtoValidation } from "./ProfileCreateDto";

export interface ProfileUpdateDto {
    biography: string;
    gender: number;
    age: number;
    main_photo_id?: number;
    location?: LocationDto;
    tags?: number[];
    sexualPreferences?: number[];
}

export const ProfileUpdateDtoValidation = joi.object({
    biography: joi.string().max(1024),
    gender: joi.number().integer(),
    age: joi.number().integer().min(18),
    main_photo_id: joi.number().integer(),
    location: LocationDtoValidation,
    tags: joi.array().items(joi.number().integer()).unique().messages({
        'array.unique': 'Les tags doivent être uniques.',
    }),
    sexualPreferences: joi.array().items(joi.number().integer()).unique().messages({
        'array.unique': 'Les préférences sexuelles doivent être uniques.',
    }),
});
