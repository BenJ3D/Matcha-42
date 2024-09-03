import joi from "joi";

const UserCreateDTO = joi.object({
    username: joi.string().required(),
    last_name: joi.string().required(),
    first_name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
});

export { UserCreateDTO };