import joi, {number} from "joi";

//Informations retournées si login == success
const LoginResponseDTO = joi.object({
    id: joi.number().required(),
    token: joi.string(),
})