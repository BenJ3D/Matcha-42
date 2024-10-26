import joi from "joi";

export const SearchValidationSchema = joi.object({
    ageMin: joi.number().integer().min(0),
    ageMax: joi.number().integer().min(joi.ref('ageMin')),
    fameMin: joi.number().integer().min(0),
    fameMax: joi.number().integer().min(joi.ref('fameMin')),
    location: joi.string(),
    tags: joi.string(),
    sortBy: joi.string().valid('username', 'age', 'fame_rating', 'city_name').optional(),
    sortOrder: joi.string().valid('asc', 'desc').optional().default('asc'),
});