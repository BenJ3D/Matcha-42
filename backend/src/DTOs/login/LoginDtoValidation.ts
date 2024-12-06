import joi from "joi";

export const LoginDtoValidation = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
})