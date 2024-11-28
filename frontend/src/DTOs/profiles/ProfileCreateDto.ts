import joi from 'joi';

export interface LocationDto {
  latitude: number;
  longitude: number;
  city?: string;
}

export interface ProfileCreateDto {
  biography: string;
  gender: number;
  age: number;
  main_photo_id?: number;
  location?: LocationDto;
  tags?: number[];
  sexualPreferences?: number[];
}

export const LocationDtoValidation = joi.object({
  latitude: joi.number().required(),
  longitude: joi.number().required(),
});

export const ProfileCreateDtoValidation = joi.object({
  biography: joi.string().max(1024).required(),
  gender: joi.number().integer().required(),
  age: joi.number().integer().min(18).max(120).required(),
  main_photo_id: joi.number().integer(),
  location: LocationDtoValidation,
  tags: joi.array().items(joi.number().integer()).unique(),
  sexualPreferences: joi.array().items(joi.number().integer()).unique(),
});
