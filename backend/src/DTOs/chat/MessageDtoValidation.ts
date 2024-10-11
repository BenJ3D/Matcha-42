import joi from 'joi';

export const CreateMessageDtoValidation = joi.object({
    target_user: joi.number().integer().required(),
    content: joi.string().max(500).required(),
});