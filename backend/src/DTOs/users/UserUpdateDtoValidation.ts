import joi from "joi";

const UserUpdateDto = joi.object({
    last_name: joi.string().required(),
    first_name: joi.string().required(),
    email: joi.string().email().required(),
})

export default { UserUpdateDto };