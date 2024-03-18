import { Request, Response, NextFunction} from "express"; //type annotation we will use for TS
import { validationResult } from "express-validator";
import { RequestValidationError } from "../errors/request-validation-error";


export const validateRequest = (req:Request,res:Response,next:NextFunction) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      throw new RequestValidationError(errors.array())
  }
  next();
};