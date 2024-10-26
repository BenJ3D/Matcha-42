import joi from "joi";

export const LoginDtoValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
})