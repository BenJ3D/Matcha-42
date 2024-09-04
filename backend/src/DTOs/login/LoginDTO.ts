import joi from "joi";

//Informations demandées pour se logger
const LoginDTO = joi.object({
    username: joi.string().required(),
    password: joi.string().required(),
})