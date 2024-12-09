import Joi from 'joi';

export const MarkAsReadDTO = Joi.object({
    notificationIds: Joi.array()
        .items(Joi.number().required())
        .required()
});