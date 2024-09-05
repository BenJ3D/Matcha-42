import {Request, Response} from 'express';
import userServices from "../services/UserServices";
import {LoginDtoValidation} from "../DTOs/login/LoginDtoValidation"
import loginServices from "../services/LoginServices";

const loginController = {
    loginWithPassword: async (req: Request, res: Response) => {
        const {error, value: loginUser} = LoginDtoValidation.validate(req.body);
        if (error) {
            return res.status(400).json({error: "Validation échouée", details: error.details});
        }
        try {
            const userId = await loginServices.login(loginUser);
            if (userId == null) {
                return res.status(401).json({error: "Incorrect login"});
            }
            return res.status(201).json({userId});
        } catch (e: any) {
            res.status(500).json({error: e.message});

        }
    }

};

export default loginController;
