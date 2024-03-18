import {Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';


interface UserPayLoad{
    id: string;
    email: string;
}

//REACHING IN TO AN EXISTING TYPE DEFINITION AND MAKE MODIFICATIONS TO IT
//we do not have to extend, just specify the namespace, and interface name, and then list the properties we want to add
declare global{
    namespace Express {
        interface Request {
            currentUser?: UserPayLoad; //additional optional property that can be defined on a request interface
        }
    }
}

export const currentUser = (req:Request, res:Response, next:NextFunction)=>{
    if(!req.session?.jwt){
        return next();
    }

    try{
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayLoad; //explicit cast, to force specific properties

        req.currentUser = payload;
        //TS requires augmentation for this line to not have an error

    }catch (e) {
        console.log(e)
    }
    //we always want to continue on to the next middleware whether or not try catch fails
    next();
}