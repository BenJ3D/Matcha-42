import joi from "joi";

export const LoginDtoValidation = joi.object({
    email: joi.string().required().max(255),
    password: joi.string().required().max(255).min(5),
})