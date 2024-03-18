import express, {Request,Response} from "express";
import {body, validationResult} from "express-validator";
import { Password } from "../services/password";
import { validateRequest,BadRequestError } from '@santickets/common';
import { User} from "../models/user";
import jwt from "jsonwebtoken";

const router = express.Router();


router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
        //we dont want to set validation properties here since validation rules may changes
        //and we dont want to block out different sets of users from signing in who adhered to some set of validation rules
    ],
    validateRequest,
    async (req:Request,res:Response)=>{
        const {email,password}=req.body
        const existingUser = await User.findOne({email});
        if(!existingUser){
            //we want to share as little information as possible when login fails so we should use a very generic error
            throw new BadRequestError('Invalid credentials');
        }
        const passWordsMatch = await Password.compare(existingUser.password,password)
        if(!passWordsMatch){
            throw new BadRequestError('Invalid credentials');
        }
        const userJwt = jwt.sign({
                id:existingUser.id,
                email: existingUser.email
            },
            process.env.JWT_KEY!
        );
        req.session = {
            jwt: userJwt
        };
        res.status(200).send(existingUser)
        /* Now done by validateRequest middleware
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const error = new Error('Invalid email or password');
            throw new RequestValidationError(errors.array());
        }
        */

});

export{
    router as signinRouter
};