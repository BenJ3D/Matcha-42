import Joi from 'joi';

const EmailDTO = Joi.object({
    email: Joi.string().email().max(255).required(),
});

export default EmailDTO;
