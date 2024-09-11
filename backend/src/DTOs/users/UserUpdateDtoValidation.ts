import joi from "joi";

export const UserUpdateDtoValidation = joi.object({
    last_name: joi.string().required(),
    first_name: joi.string().required(),
    email: joi.string().email().required(),
})
