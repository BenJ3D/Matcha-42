import joi from "joi";

export const SearchValidationSchema = joi.object({
    ageMin: joi.number().integer().min(18).max(120),
    ageMax: joi.number().integer().min(18).max(120),
    fameMin: joi.number().integer().min(0).max(10),
    fameMax: joi.number().integer().min(joi.ref('fameMin')).max(10),
    location: joi.string().max(255),
    tags: joi.string(),
    sortBy: joi.string().valid('username', 'age', 'fame_rating', 'city_name').optional(),
    sortOrder: joi.string().valid('asc', 'desc').optional().default('asc'),
});