import joi from "joi";

export const UserUpdateDtoValidation = joi.object({
    last_name: joi.string().required().max(255).min(5),
    first_name: joi.string().required().max(255).min(5),
})
