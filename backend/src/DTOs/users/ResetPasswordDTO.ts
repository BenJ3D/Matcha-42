import Joi from 'joi';

const ResetPasswordDTO = Joi.object({
    newPassword: Joi.string().min(5).max(255).required(),
    token: Joi.string().required(),
});

export default ResetPasswordDTO;
