import { Request, Response, NextFunction } from "express";
import { NotAuthorizedError } from "../errors/not-authorized-error";

export const requireAuth = (req:Request, res:Response, next:NextFunction)=>{
    //We are making a big assumption here which is that we will NEVER run this requireAuth middleware
    // without previously running the currentUser middleware
    //so in otherwords by the time this request shows up inside of requireAuth, we should have already checked if there
    //is a JWT present, as well as attempt to decode it and set it on the currentUser property
    if(!req.currentUser){
        throw new NotAuthorizedError();
    }
    next();
}