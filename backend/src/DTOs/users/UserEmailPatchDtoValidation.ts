import joi from "joi";

export const UserEmailPatchDtoValidation = joi.object({
    email: joi.string().email().required(),
})
