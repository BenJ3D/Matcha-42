import joi from "joi";

export const UserCreateDtoValidation = joi.object({
    username: joi.string().required().max(50),
    last_name: joi.string().required().max(255).min(2),
    first_name: joi.string().required().max(255).min(2),
    email: joi.string().email().required().max(255).min(2),
    password: joi.string().required().max(255).min(2),
});
